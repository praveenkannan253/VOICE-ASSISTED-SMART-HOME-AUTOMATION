# PowerShell script to run Fridge Detection with virtual environment

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Starting Fridge Detection System" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
Set-Location "d:\Documents\SMARTHOME"

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Navigate to fridge detection folder
Set-Location "python\features"

Write-Host ""
Write-Host "Running: python fridge_detection.py" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Run the detection script
python fridge_detection.py
