let selectedFile = null;
let selectedModel = 'base';
let transcriptionResult = null;

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Load data for specific tabs
        if (tab === 'history') loadHistory();
        if (tab === 'corrections') loadCorrections();
    });
});

// File Upload
document.getElementById('audioFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        const fileInfo = document.getElementById('fileInfo');
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileInfo.innerHTML = `
            <strong>📁 ${file.name}</strong><br>
            Tamanho: ${sizeMB} MB
        `;
        fileInfo.style.display = 'block';
        document.getElementById('transcribeBtn').disabled = false;
    }
});

// Model Selection
document.querySelectorAll('.model-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.model-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedModel = card.dataset.model;
    });
});

// Transcribe
let progressInterval = null;
let estimatedTime = 0;
let previewSegments = [];
let eventSource = null;

document.getElementById('transcribeBtn').addEventListener('click', async () => {
    if (!selectedFile) return;
    
    // Hide results, show progress
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('livePreview').style.display = 'block';
    document.getElementById('previewSegments').innerHTML = '';
    previewSegments = [];
    
    // Estimar tempo baseado no tamanho do arquivo e modelo
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    const modelMultiplier = {
        'tiny': 0.5,
        'base': 1,
        'small': 2,
        'medium': 4,
        'large': 8
    };
    estimatedTime = fileSizeMB * 10 * (modelMultiplier[selectedModel] || 1);
    
    // Iniciar barra de progresso
    startProgressSimulation(estimatedTime);
    
    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('model', selectedModel);
    
    try {
        // Usar endpoint de streaming
        const response = await fetch('/api/transcribe-stream', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let allSegments = [];
        
        while (true) {
            const {done, value} = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, {stream: true});
            const lines = buffer.split('\n');
            buffer = lines.pop();
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.type === 'segment') {
                        allSegments.push(data);
                        addRealPreviewSegment(data);
                    } else if (data.type === 'complete') {
                        stopProgressSimulation();
                        transcriptionResult = {
                            text: data.text,
                            segments: allSegments,
                            stats: data.stats
                        };
                        displayResults(transcriptionResult);
                        
                        document.getElementById('progressSection').style.display = 'none';
                        document.getElementById('resultsSection').style.display = 'block';
                        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
                    } else if (data.type === 'error') {
                        throw new Error(data.message);
                    }
                }
            }
        }
        
    } catch (error) {
        stopProgressSimulation();
        alert('Erro ao transcrever: ' + error.message);
        document.getElementById('progressSection').style.display = 'none';
    }
});

// Simular progresso baseado em tempo estimado
function startProgressSimulation(estimatedSeconds) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressTime = document.querySelector('.progress-time');
    
    let elapsed = 0;
    const updateInterval = 100;
    
    progressFill.style.animation = 'none';
    progressFill.style.width = '0%';
    
    progressInterval = setInterval(() => {
        elapsed += updateInterval / 1000;
        
        let progress = Math.min((elapsed / estimatedSeconds) * 100, 95);
        
        if (progress > 70) {
            progress = 70 + (progress - 70) * 0.5;
        }
        
        progressFill.style.width = progress + '%';
        progressPercentage.textContent = Math.floor(progress) + '%';
        
        const remainingTime = Math.max(0, Math.ceil(estimatedSeconds - elapsed));
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        
        if (remainingTime > 0) {
            progressTime.textContent = `Tempo estimado: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            progressText.textContent = 'Processando áudio com Whisper AI...';
        } else {
            progressTime.textContent = 'Quase pronto...';
            progressText.textContent = 'Finalizando transcrição...';
        }
    }, updateInterval);
}

function addRealPreviewSegment(segment) {
    const previewSegments = document.getElementById('previewSegments');
    const startTime = formatTime(segment.start);
    const endTime = formatTime(segment.end);
    
    const segmentHtml = `
        <div class="preview-segment">
            <div class="preview-segment-time">${startTime} → ${endTime}</div>
            <div class="preview-segment-text">${segment.text}</div>
        </div>
    `;
    
    previewSegments.insertAdjacentHTML('beforeend', segmentHtml);
    previewSegments.scrollTop = previewSegments.scrollHeight;
}

function stopProgressSimulation() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Completar barra
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    progressFill.style.width = '100%';
    progressPercentage.textContent = '100%';
}

// Display Results
function displayResults(data) {
    // Stats
    document.getElementById('statDuration').textContent = `${data.stats.duration.toFixed(1)} min`;
    document.getElementById('statProcessing').textContent = `${data.stats.processing_time.toFixed(1)}s`;
    document.getElementById('statWords').textContent = data.stats.word_count;
    document.getElementById('statModel').textContent = data.stats.model.toUpperCase();
    
    // Full text
    document.getElementById('fullText').textContent = data.text;
    
    // Segments with timestamps
    const segmentsHtml = data.segments.map(seg => {
        const startTime = formatTime(seg.start);
        const endTime = formatTime(seg.end);
        return `
            <div class="segment">
                <div class="segment-time">${startTime} → ${endTime}</div>
                <div class="segment-text">${seg.text}</div>
            </div>
        `;
    }).join('');
    document.getElementById('segmentsText').innerHTML = segmentsHtml;
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Result Tabs
document.querySelectorAll('.result-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.resultTab;
        
        document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.result-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${targetTab}Text`).classList.add('active');
    });
});

// Copy Text
function copyText() {
    if (!transcriptionResult) return;
    
    navigator.clipboard.writeText(transcriptionResult.text).then(() => {
        showToast('✅ Texto copiado!');
    });
}

// Download Text
function downloadText() {
    if (!transcriptionResult) return;
    
    const blob = new Blob([transcriptionResult.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcricao.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('✅ Download iniciado!');
}

// Load History
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        const data = await response.json();
        
        const historyList = document.getElementById('historyList');
        
        if (data.history.length === 0) {
            historyList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray);">
                    <p style="font-size: 1.2rem;">Nenhuma transcrição ainda</p>
                    <p>Faça sua primeira transcrição!</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = data.history.map(item => {
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="history-card">
                    <div class="history-header">
                        <div>
                            <div class="history-title">📁 ${item.arquivo}</div>
                            <div class="history-date">🕐 ${dateStr}</div>
                        </div>
                    </div>
                    <div class="history-stats">
                        <div class="history-stat">
                            <span>⏱️</span>
                            <span>${item.duracao_min.toFixed(1)} min</span>
                        </div>
                        <div class="history-stat">
                            <span>⚡</span>
                            <span>${item.tempo_proc.toFixed(1)}s</span>
                        </div>
                        <div class="history-stat">
                            <span>📝</span>
                            <span>${item.palavras} palavras</span>
                        </div>
                        <div class="history-stat">
                            <span>🤖</span>
                            <span>${item.modelo.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="history-preview">${item.preview}</div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Load Corrections
async function loadCorrections() {
    try {
        const response = await fetch('/api/corrections');
        const data = await response.json();
        
        const correctionsList = document.getElementById('correctionsList');
        const corrections = data.corrections;
        const entries = Object.entries(corrections);
        
        if (entries.length === 0) {
            correctionsList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <p>Nenhuma correção cadastrada</p>
                </div>
            `;
            return;
        }
        
        correctionsList.innerHTML = entries.map(([wrong, correct]) => `
            <div class="correction-item">
                <div class="correction-words">
                    <div class="correction-word">
                        <div class="correction-label">Incorreto</div>
                        <div class="correction-value">${wrong}</div>
                    </div>
                    <div style="color: var(--primary); font-size: 1.5rem;">→</div>
                    <div class="correction-word">
                        <div class="correction-label">Correto</div>
                        <div class="correction-value">${correct}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar correções:', error);
    }
}

// Add Correction
async function addCorrection() {
    const wrong = document.getElementById('wrongWord').value.trim();
    const correct = document.getElementById('correctWord').value.trim();
    
    if (!wrong || !correct) {
        showToast('⚠️ Preencha ambos os campos');
        return;
    }
    
    try {
        const response = await fetch('/api/corrections', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wrong, correct })
        });
        
        const data = await response.json();
        
        if (data.error) {
            showToast('❌ ' + data.error);
            return;
        }
        
        showToast('✅ Correção adicionada!');
        document.getElementById('wrongWord').value = '';
        document.getElementById('correctWord').value = '';
        loadCorrections();
        
    } catch (error) {
        showToast('❌ Erro ao adicionar correção');
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, var(--primary), var(--secondary));
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
