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
