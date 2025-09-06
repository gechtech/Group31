<<<<<<< HEAD
# social engineering atacks detector and analaysis Tool
this tool is a **Next.js + TypeScript** application designed to detect **malicious and phishing URLs**.  

This is a **Next.js + TypeScript** application designed to detect **malicious and phishing URLs**.  

It uses **keyword-based scanning** and **AI-powered detection** (VirusTotal API) to help identify suspicious links before you click them.

This tool is designed to be **useful for everyone** – from regular internet users to security researchers – making the web a safer place for all.

---

## ✨ Features

- **Keyword-based detection** – instantly flags URLs containing suspicious domains or words.
- **AI-powered detection** – uses VirusTotal’s API to analyze URLs for known threats.
- **Simple & fast interface** – enter a URL and get results in seconds.
- **Privacy-friendly** – no unnecessary data storage.
- **Cross-platform** – works anywhere you can run a Next.js app.

---

## 📦 Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/gechtech/Group31.git
cd Group31
```



2️⃣ Install Dependencies
Using npm use -force if you get an error:
```bash
npm install
```
Or with pnpm:
```bash
pnpm install
```
Or with yarn:
```bash
yarn install
```
3️⃣ Set Up Environment Variables
Create a .env.local file in the root directory and add:
```bash
NEXT_PUBLIC_GROQ_API_KEY=your_api_key_here
```
You can get a free gorq API key from https://groq.com/

🚀 Running the App
Development Mode
```bash
npm run dev
```
or
```bash
pnpm dev
```
This will start the  web app on:

http://localhost:3000


Safe Browse Guard Extension

The Safe Browse Guard Extension helps protect users from online threats by blocking access to 30+ known malicious and phishing websites.

🔒 Key Features

Automatically detects and blocks dangerous sites.

Prevents access to phishing and malware-hosting domains.

Lightweight, fast, and easy to use.


🛠 How to Use
Open the app in your browser.

Paste the URL you want to check.

Choose:

Analyze with Keyword – quick detection using predefined phishing patterns.

Analyze with AI – deep scan using VirusTotal API.

See results instantly with threat level indicators.

💡 Why This Tool is for Everyone
Whether you are:

🧑‍💻 A developer wanting to check URLs in your app

🔐 A cybersecurity researcher analyzing potential phishing sites

👨‍👩‍👧‍👦 An everyday user wanting to stay safe online


this tool gives you the power to detect threats easily and protect yourself from scams.

This tool gives you the power to detect threats easily and protect yourself from scams.












=======
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
>>>>>>> 193e10506d83c6c893e758edae8a9427c4c71986
