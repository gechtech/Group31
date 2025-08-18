import re

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "update", "urgent", "click", "reset",
    "account", "password", "bank", "invoice", "credit card", "ssn",
    "confirm", "unusual", "suspend", "secure", "locked"
]

SUSPICIOUS_DOMAINS = ["bit.ly", "tinyurl.com", "ow.ly", "phishingsite.com", "malicious.com", "camphish.com","servio.net"]

def check_url(url):
    findings = []
    for domain in SUSPICIOUS_DOMAINS:
        if domain in url:
            findings.append(f"Suspicious domain: {domain}")
    if url and not url.startswith("https://"):
        findings.append("URL is not using HTTPS")
    return findings

def check_text(text):
    findings = []
    for keyword in SUSPICIOUS_KEYWORDS:
        count = text.lower().count(keyword)
        findings.extend([f"Suspicious keyword found: {keyword}"] * count)
    # Credit card pattern
    if re.search(r'\b(?:\d[ -]*?){13,16}\b', text):
        findings.append("Possible credit card number detected")
    return findings

def analyze_input(url, text):
    results = []
    if url:
        results += check_url(url)
    if text:
        results += check_text(text)

    keyword_matches = len(results)
    percentage = min(int((keyword_matches / 30) * 100), 100)

    return {
        "is_suspicious": keyword_matches >= 3,
        "score": percentage,
        "findings": results,

    }
