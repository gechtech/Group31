
# phishing-detector

🔐 Phishing & Malicious Detection Platform

A secure web platform with a Python (Flask) backend for detecting malicious URLs, phishing emails, and files.
It combines AI-powered analysis with keyword-based detection for accurate results and integrates user management, admin monitoring, and a lightweight Web Application Firewall (WAF).

✨ Features
🛡 Detection & Security

Malicious URL & File Detection – Analyze URLs, files, and email content for phishing or malicious intent.

Two Detection Systems

AI-Based Analysis – Uses large language models for context-aware detection.

Keyword-Based Analysis – Lightweight detection for fast and simple checks.

Knowledge Section – Built-in phishing awareness with Q&A for educational purposes.

WAF Protection – Monitors abnormal activity such as brute force, dictionary attacks, fuzzing, DoS/DDoS, and blocks suspicious IPs for 20 seconds.

👤 User Features

Login & Signup – Secure registration required to access detection tools.

Profile Management

Update username, password, and profile picture.

Option to permanently delete account.

User Dashboard – Displays detection tools, phishing knowledge, and contact options.

Temporary Block Page – If blocked by WAF, user sees a countdown timer before returning to the main page.

📬 Contact & Communication

Contact Form – Available to both registered and unregistered users.

Submissions are securely stored server-side for admin review.

🛠 Admin Features

Admin Login with Super Password – Secured access to admin dashboard.

User Management

View active and deleted profiles.

Monitor users by ID.

Reset user credentials and provide temporary login passwords.

Permanently remove accounts.

WAF Monitoring

See blocked IP addresses.

Option to unblock IPs manually.

Admin Account Security – Admin can change their own access password.

🧰 Tech Stack

Backend: Python (Flask)

Frontend: HTML, CSS, JavaScript

Database: SQLite / PostgreSQL (configurable)

Authentication: JWT or Flask-Login

AI Detection: Groq API (LLM models like gemma2-9b-it)

WAF: Custom Python middleware for rate limiting & attack detection

🚀 Getting Started
1. Clone the Repository
```bash
git clone https://github.com/gechtech/Group31.git
cd Group31
```

3. Install Dependencies
```bash
pip install -r requirements.txt
```

5. Configure Environment

Create a .env file in the root directory:

```bash
GROQ_API_KEY=your_groq_api_key
VIRUSTOTAL_API_KEY=your_virus-total_api_key
```

4. Run the Server
```bash
python app.py
```


Visit → http://127.0.0.1:2000

📊 Roadmap

 Add file upload sandbox for malware scanning.

 Integrate external threat intelligence feeds.

 Enable 2FA for user accounts.

 Expand WAF rules with machine-learning anomaly detection.

🛡 Security Notes

This platform is designed for educational and research purposes.

Do not use in production without proper security hardening.

WAF is basic and should be supplemented with dedicated firewalls for enterprise deployments.
=======
# Scam Detection Project

A project focused on detecting social engineering and scam patterns using text analysis.

## 🚀 Features
- Detects scam and fraud patterns in text.
- **Quid Pro Quo Detection** *(New Feature)*:
  - Added `quid_pro_quo_detector.py` to identify quid pro quo scam patterns.
  - Scans for:
    - Offers of exchange
    - Requests for sensitive information
    - Exchange-related phrases
    - Urgency cues
  - Labels text as:
    - `likely_safe`
    - `likely_safe_but_suspicious`
    - `suspicious`
  - Displays detailed triggers and reasons in the web app sidebar.

## 🛠️ Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/TEAM_USERNAME/PROJECT_NAME.git
Navigate to the project folder:

cd PROJECT_NAME


Install dependencies:

pip install -r requirements.txt

📖 Usage

Run the web application:

python app.py

