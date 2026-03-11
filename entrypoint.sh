#!/bin/sh
PORT="${PORT:-5000}"
exec gunicorn app:app --bind "0.0.0.0:${PORT}" --timeout 600 --workers 1
