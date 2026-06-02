# PowerShell Setup Script for AI Farmer Advisory System Backend

Write-Host "=========================================" -ForegroundColor Green
Write-Host "   AI Farmer Advisory System - Backend Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Check Python installation
$pythonPath = Get-Command python -ErrorAction SilentlyContinue

if (-not $pythonPath) {
    Write-Host ""
    Write-Host "[WARNING] Python was not found in your system's environment PATH." -ForegroundColor Yellow
    Write-Host "Please do one of the following to install Python:" -ForegroundColor White
    Write-Host "  1. Install Python from the Microsoft Store (search 'Python 3.11' or 'Python 3.12')." -ForegroundColor Cyan
    Write-Host "  2. Download Python from https://www.python.org/downloads/ (Make sure to check 'Add python.exe to PATH' during installation)." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Once Python is installed, restart your terminal and run this script again." -ForegroundColor Yellow
    Exit 1
}

Write-Host "[OK] Python is installed: $($pythonPath.Source)" -ForegroundColor Green

# 2. Check CWD is project root and enter backend directory
if (Test-Path .\backend) {
    Set-Location .\backend
} elseif (-not (Test-Path .\requirements.txt)) {
    Write-Host "[ERROR] Could not locate backend files. Please run this script from the project root." -ForegroundColor Red
    Exit 1
}

# 3. Create virtual environment
if (-not (Test-Path .venv)) {
    Write-Host "Creating virtual environment (.venv)..." -ForegroundColor Cyan
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create virtual environment." -ForegroundColor Red
        Exit 1
    }
}
Write-Host "[OK] Virtual environment exists." -ForegroundColor Green

# 4. Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .venv\Scripts\Activate.ps1

# 5. Install requirements
Write-Host "Installing pip packages (this may take a few seconds)..." -ForegroundColor Cyan
python -m pip install --upgrade pip
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Some packages failed to install. Retrying..." -ForegroundColor Yellow
    pip install Flask Flask-CORS PyJWT bcrypt pymongo Pillow numpy
}

Write-Host ""
Write-Host "[SUCCESS] Backend setup completed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host " Default accounts created on startup:" -ForegroundColor White
Write-Host "   - Farmer: farmer@farmer.com  (password: farmer123)" -ForegroundColor Cyan
Write-Host "   - Admin:  admin@farmer.com   (password: admin123)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Launching Flask server now..." -ForegroundColor Yellow
python app.py
