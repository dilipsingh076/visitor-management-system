@echo off
cd /d "%~dp0"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
python -m pip install -r requirements.txt -q
echo Starting backend (SQLite) at http://localhost:8000
python -m uvicorn app.main:app --reload --host 0.0.0.0
