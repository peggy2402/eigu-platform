#!/bin/bash
# Setup script for self-hosted OmniVoice
# Tự động tạo venv, không ảnh hưởng system Python

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

echo "=== Cài đặt OmniVoice cho EIGU Platform ==="

# Kiểm tra Python
PYTHON=$(command -v python3 || command -v python)
if [ -z "$PYTHON" ]; then
    echo "Lỗi: Cần Python 3.10+. Cài tại https://python.org"
    exit 1
fi
echo "Dùng Python: $($PYTHON --version)"

# Tạo virtual environment
if [ ! -d "$VENV_DIR" ]; then
    echo "1. Tạo virtual environment tại $VENV_DIR ..."
    $PYTHON -m venv "$VENV_DIR"
fi

# Activate venv
source "$VENV_DIR/bin/activate"

echo "2. Cài đặt omnivoice package..."
pip install --upgrade pip
pip install omnivoice

echo ""
echo "3. Kiểm tra model download..."
python3 -c "
from omnivoice import OmniVoice
import torch
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
print(f'Using device: {device}')
model = OmniVoice.from_pretrained(
    'k2-fsa/OmniVoice',
    device_map=device,
    dtype=torch.float16 if device == 'mps' else torch.float32,
)
print('Model loaded successfully!')
"

echo ""
echo "=== Hoàn tất! ==="
echo "Venv: $VENV_DIR"
echo ""
echo "Cập nhật .env:"
echo "  OMNIVOICE_MODE=python"
echo "  OMNIVOICE_VENV=$VENV_DIR"
