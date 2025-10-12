# backend/quid_pro_quo_detector.py
# Simple Quid Pro Quo detector using keyword/rule heuristics.
# No external services needed. Safe for beginners.

import re
from typing import List, Dict

# Words/phrases commonly seen in quid-pro-quo scams
OFFER_WORDS = [
    "free", "reward", "gift", "bonus", "discount", "coupon", "voucher",
    "upgrade", "premium", "help", "support", "fix", "unlock", "activate", "verify"
]

SENSITIVE_WORDS = [
    "password", "passcode", "pin", "otp", "one-time code", "verification code",
    "credentials", "login", "account number", "bank", "card", "cvv", "ssn"
]

EXCHANGE_PHRASES = [
    "in exchange", "if you give", "if you share", "if you provide",
    "i will give", "i can give", "i can upgrade", "i can fix", "i can help",
    "i will help", "we will help", "we can help"
]

URGENCY_WORDS = [
    "now", "immediately", "urgent", "asap", "right away", "today", "within 24 hours"
]

def _normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())

def _find_matches(corpus: List[str], text: str) -> List[str]:
    hits = set()
    for w in corpus:
        # Word-boundary search for single words, substring for multi-words
        if " " in w:
            if w in text:
                hits.add(w)
        else:
            if re.search(rf"\b{re.escape(w)}\b", text):
                hits.add(w)
    return sorted(hits)
def analyze_text(text: str) -> Dict:
    t = _normalize(text)

    offer_hits = _find_matches(OFFER_WORDS, t)
    sensitive_hits = _find_matches(SENSITIVE_WORDS, t)
    exchange_hits = _find_matches(EXCHANGE_PHRASES, t)
    urgency_hits = _find_matches(URGENCY_WORDS, t)

    triggers = {
        "offer": offer_hits,
        "sensitive": sensitive_hits,
        "exchange": exchange_hits,
        "urgency": urgency_hits,
    }

    num_triggers = sum(1 for v in triggers.values() if v)
    reasons = []
    if offer_hits:
        reasons.append("Offer word(s) detected: " + ", ".join(offer_hits))
    if sensitive_hits:
        reasons.append("Sensitive word(s) detected: " + ", ".join(sensitive_hits))
    if exchange_hits:
        reasons.append("Exchange phrase(s) detected: " + ", ".join(exchange_hits))
    if urgency_hits:
        reasons.append("Urgency word(s) detected: " + ", ".join(urgency_hits))

    # Label logic
    if num_triggers == 0:
        label = "likely_safe"
        score = 0
    elif num_triggers == 1:
        label = "likely_safe_but_suspicious"
        score = 30
        reasons.append("Something suspicious was found, but not enough to be sure.")
    else:
        label = "suspicious"
        score = 70

    return {
        "label": label,
        "score": score,
        "triggers": triggers,
        "reasons": reasons
    }

   

if __name__ == "__main__":
    # quick local test: python backend/quid_pro_quo_detector.py "your message here"
    import sys, json
    sample = " ".join(sys.argv[1:]) or "I can upgrade your account for free if you share your password now."
    print(json.dumps(analyze_text(sample), indent=2))
