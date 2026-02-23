# Run backend with SQLite (no PostgreSQL required)
# Requires: Python 3.10+ with venv
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}
& ".\venv\Scripts\Activate.ps1"
python -m pip install -r requirements.txt -q
Write-Host "Starting backend (SQLite) at http://localhost:8000"
python -m uvicorn app.main:app --reload --host 0.0.0.0
