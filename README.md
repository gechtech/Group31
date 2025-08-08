# PDAT — Phishing Detection and Analysis Tool 

This package contains a lightweight, developer-friendly PDAT skeleton with a simple Flask backend and a React frontend (single-page). It's designed to be easy to run locally for testing and development.

## Structure
{
  'pdat/': [
    'backend/ (Flask API)',
    'frontend/ (React app)'
  ]
}

## Quick start - Backend
1. Create a Python virtualenv and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
   Note: `python-magic` may require system lib `libmagic` (Linux: `libmagic`/`file` package).
2. Run the backend:
   ```bash
   python backend/app.py
   ```
   The API will be available at `http://localhost:5000` with endpoints:
   - `POST /check-url`  -> JSON { url: "<url>" }
   - `POST /check-email` -> JSON { email: "<raw email text>" }
   - `POST /upload-file` -> form-data `file`

## Quick start - Frontend (React)
1. Change directory and install packages:
   ```bash
   cd frontend
   npm install
   npm start
   ```
2. The app will open at `http://localhost:3000` and call the backend at `http://localhost:5000` by default.
   To use a different backend base URL set `REACT_APP_API_BASE` env var before starting the frontend.

## Notes & Next steps
- This is a development skeleton. For production, integrate with the project's real backend, database, authentication, and secure file storage.
- You can extend `backend/phishing_detector.py` (add ML models, feeds), and `backend/malware_scanner.py` (add YARA rules, VirusTotal integration).
- If you want, I can patch this code directly into your original project ZIP or create a runnable Docker setup.
