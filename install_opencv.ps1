# Install OpenCV from pre-built wheel
# This script downloads and installs opencv-python without SSL issues

Write-Host "🔧 Installing OpenCV Python..." -ForegroundColor Cyan

# Get Python version
$pythonVersion = python --version 2>&1
Write-Host "Python version: $pythonVersion" -ForegroundColor Green

# Check if pip is available
$pipVersion = pip --version 2>&1
Write-Host "Pip version: $pipVersion" -ForegroundColor Green

# Try installing opencv-python-headless first (no GUI dependencies)
Write-Host "`n📦 Attempting to install opencv-python-headless..." -ForegroundColor Yellow
pip install opencv-python-headless --prefer-binary 2>&1

# If that fails, try with index URL
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️ Headless install failed, trying with alternative index..." -ForegroundColor Yellow
    pip install -i https://mirrors.aliyun.com/pypi/simple/ opencv-python-headless 2>&1
}

# Install other required packages
Write-Host "`n📦 Installing Pillow..." -ForegroundColor Yellow
pip install pillow --prefer-binary 2>&1

Write-Host "`n📦 Installing NumPy..." -ForegroundColor Yellow
pip install numpy --prefer-binary 2>&1

# Verify installation
Write-Host "`n✅ Verifying installation..." -ForegroundColor Green
python -c "import cv2; print('✅ OpenCV version:', cv2.__version__)" 2>&1
python -c "import PIL; print('✅ Pillow installed')" 2>&1
python -c "import numpy; print('✅ NumPy version:', numpy.__version__)" 2>&1

Write-Host "`n🎉 Installation complete!" -ForegroundColor Green
Write-Host "You can now run: python python\features\fridge_detection.py" -ForegroundColor Cyan
