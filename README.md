# JU – Malicious URL & Phishing Detection Tool

JU is a **Next.js + TypeScript** application designed to detect **malicious and phishing URLs**.  
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
git clone https://github.com/Animhassen/JU.git
cd JU
```



2️⃣ Install Dependencies
Using npm:
use -force on windows like npm install -force
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
NEXT_PUBLIC_VIRUSTOTAL_API_KEY=your_api_key_here
```
You can get a free VirusTotal API key from https://www.virustotal.com/gui/join-us

🚀 Running the App
Development Mode
```bash
npm run dev
```
or
```bash
pnpm dev
```
This will start the app on:

http://localhost:3000



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

JU gives you the power to detect threats easily and protect yourself from scams.
