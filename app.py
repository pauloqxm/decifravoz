import os
import json
import time
import traceback
import subprocess
import threading
import uuid
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, Response, stream_with_context
from werkzeug.utils import secure_filename
import whisper
import torch

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max
app.config['DATA_FOLDER'] = 'data'

# Criar pastas imediatamente ao iniciar
os.makedirs('uploads', exist_ok=True)
os.makedirs('data', exist_ok=True)

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'mp4', 'm4a', 'ogg', 'flac'}

# Carregar correções customizadas
def load_corrections():
    corrections_path = os.path.join(app.config['DATA_FOLDER'], 'correcoes_custom.json')
    if os.path.exists(corrections_path):
        with open(corrections_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# Salvar histórico
def save_to_history(data):
    history_path = os.path.join(app.config['DATA_FOLDER'], 'historico_transcricoes.json')
    history = []
    if os.path.exists(history_path):
        with open(history_path, 'r', encoding='utf-8') as f:
            history = json.load(f)
    history.insert(0, data)
    with open(history_path, 'w', encoding='utf-8') as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

# Carregar histórico
def load_history():
    history_path = os.path.join(app.config['DATA_FOLDER'], 'historico_transcricoes.json')
    if os.path.exists(history_path):
        with open(history_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def apply_corrections(text, corrections):
    for wrong, correct in corrections.items():
        text = text.replace(wrong, correct)
    return text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify({
        'models': ['tiny', 'base', 'small', 'medium', 'large']
    })

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['audio']
    model_name = request.form.get('model', 'base')
    
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Formato de arquivo não suportado'}), 400
    
    filepath = None
    try:
        upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
        os.makedirs(upload_folder, exist_ok=True)
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisper.load_model(model_name, device=device)
        
        start_time = time.time()
        
        result = model.transcribe(
            filepath,
            language='pt',
            fp16=False,
            verbose=True,
            task='transcribe',
            word_timestamps=True,
            condition_on_previous_text=True,
            initial_prompt="Transcrição em português brasileiro."
        )
        
        processing_time = time.time() - start_time
        
        corrections = load_corrections()
        text = result.get('text', '')
        corrected_text = apply_corrections(text, corrections)
        
        segments = []
        for seg in result.get('segments', []):
            segments.append({
                'start': seg.get('start', 0),
                'end': seg.get('end', 0),
                'text': apply_corrections(seg.get('text', ''), corrections)
            })
        
        duration_min = result.get('duration', 0) / 60
        word_count = len(corrected_text.split())
        preview = corrected_text[:500] + "..." if len(corrected_text) > 500 else corrected_text
        
        history_data = {
            'timestamp': datetime.now().isoformat(),
            'arquivo': filename,
            'modelo': model_name,
            'duracao_min': duration_min,
            'tempo_proc': processing_time,
            'palavras': word_count,
            'preview': preview
        }
        save_to_history(history_data)
        
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            'success': True,
            'text': corrected_text,
            'segments': segments,
            'stats': {
                'duration': duration_min,
                'processing_time': processing_time,
                'word_count': word_count,
                'model': model_name
            }
        })
    
    except Exception as e:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except:
                pass
        
        error_msg = str(e)
        error_trace = traceback.format_exc()
        print("="*60)
        print("ERRO NA TRANSCRIÇÃO:")
        print("="*60)
        print(f"Mensagem: {error_msg}")
        print("\nStack trace completo:")
        print(error_trace)
        print("="*60)
        return jsonify({'error': f'Erro ao processar áudio: {error_msg}'}), 500

@app.route('/api/transcribe-stream', methods=['POST'])
def transcribe_stream():
    """Endpoint para transcrição com streaming de segmentos em tempo real"""
    if 'audio' not in request.files:
        return jsonify({'error': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['audio']
    model_name = request.form.get('model', 'base')
    
    if file.filename == '':
        return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Formato de arquivo não suportado'}), 400
    
    upload_folder = os.path.abspath(app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_folder, exist_ok=True)
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    
    def generate():
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = whisper.load_model(model_name, device=device)
            
            start_time = time.time()
            corrections = load_corrections()
            
            # Transcrever e enviar segmentos conforme são processados
            result = model.transcribe(
                filepath,
                language='pt',
                fp16=False,
                verbose=False,
                task='transcribe',
                word_timestamps=True,
                condition_on_previous_text=True,
                initial_prompt="Transcrição em português brasileiro."
            )
            
            # Enviar segmentos um por um
            for seg in result.get('segments', []):
                segment_data = {
                    'type': 'segment',
                    'start': seg.get('start', 0),
                    'end': seg.get('end', 0),
                    'text': apply_corrections(seg.get('text', '').strip(), corrections)
                }
                yield f"data: {json.dumps(segment_data)}\n\n"
                time.sleep(0.1)  # Pequeno delay para simular streaming
            
            processing_time = time.time() - start_time
            text = result.get('text', '')
            corrected_text = apply_corrections(text, corrections)
            
            duration_min = result.get('duration', 0) / 60
            word_count = len(corrected_text.split())
            
            # Enviar resultado final
            final_data = {
                'type': 'complete',
                'text': corrected_text,
                'stats': {
                    'duration': duration_min,
                    'processing_time': processing_time,
                    'word_count': word_count,
                    'model': model_name
                }
            }
            yield f"data: {json.dumps(final_data)}\n\n"
            
            # Salvar histórico
            preview = corrected_text[:500] + "..." if len(corrected_text) > 500 else corrected_text
            history_data = {
                'timestamp': datetime.now().isoformat(),
                'arquivo': filename,
                'modelo': model_name,
                'duracao_min': duration_min,
                'tempo_proc': processing_time,
                'palavras': word_count,
                'preview': preview
            }
            save_to_history(history_data)
            
        except Exception as e:
            error_data = {
                'type': 'error',
                'message': str(e)
            }
            yield f"data: {json.dumps(error_data)}\n\n"
        
        finally:
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@app.route('/api/history', methods=['GET'])
def get_history():
    history = load_history()
    return jsonify({'history': history[:20]})  # Últimas 20 transcrições

@app.route('/api/corrections', methods=['GET'])
def get_corrections():
    corrections = load_corrections()
    return jsonify({'corrections': corrections})

@app.route('/api/corrections', methods=['POST'])
def add_correction():
    data = request.json
    wrong = data.get('wrong', '').strip()
    correct = data.get('correct', '').strip()
    
    if not wrong or not correct:
        return jsonify({'error': 'Campos inválidos'}), 400
    
    corrections = load_corrections()
    corrections[wrong] = correct
    
    corrections_path = os.path.join(app.config['DATA_FOLDER'], 'correcoes_custom.json')
    with open(corrections_path, 'w', encoding='utf-8') as f:
        json.dump(corrections, f, ensure_ascii=False, indent=2)
    
    return jsonify({'success': True, 'corrections': corrections})

if __name__ == '__main__':
    # Criar pastas necessárias
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['DATA_FOLDER'], exist_ok=True)
    
    # Criar arquivos iniciais se não existirem
    corrections_path = os.path.join(app.config['DATA_FOLDER'], 'correcoes_custom.json')
    if not os.path.exists(corrections_path):
        with open(corrections_path, 'w', encoding='utf-8') as f:
            json.dump({}, f)
    
    history_path = os.path.join(app.config['DATA_FOLDER'], 'historico_transcricoes.json')
    if not os.path.exists(history_path):
        with open(history_path, 'w', encoding='utf-8') as f:
            json.dump([], f)
    
    print("="*60)
    print("DecifraVoz - Sistema de Transcrição")
    print("="*60)
    print(f"Pasta uploads: {os.path.abspath(app.config['UPLOAD_FOLDER'])}")
    print(f"Pasta data: {os.path.abspath(app.config['DATA_FOLDER'])}")
    print("="*60)
    print()
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
