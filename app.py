from flask import Flask, request, jsonify, render_template, make_response, redirect, url_for, flash, send_from_directory, get_flashed_messages
from flask_cors import CORS
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
import threading, time, json, os, atexit
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_user, logout_user, login_required, current_user
from dotenv import load_dotenv
from urllib.parse import urlparse
import requests
from flask import Flask, request, jsonify, render_template_string, redirect, url_for, session, send_from_directory
import os
import json as _json
import secrets
import string
import hashlib
import base64
# Load environment variables from a .env file in the same directory as this app.py
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))


# ----------------------------
# Config (tune to your needs)
# ----------------------------
WINDOW_SECONDS        = 15
MAX_POST_REQUESTS     = 15          # POST requests threshold
MAX_OTHER_REQUESTS    = 25          # Non-POST requests threshold
BASE_BLOCK_SECONDS    = 20
BLOCK_MULTIPLIER      = 2
MAX_BLOCK_SECONDS     = 10 * 60      # 10 minutes
BLOCKED_IPS_FILE      = "blocked_ips.json"
USE_X_FORWARDED_FOR   = True         # honor X-Forwarded-For when behind a proxy
ADMIN_TOKEN           = os.getenv("ADMIN_TOKEN", None)  # optional for /unblock
EXTENSION_TOKEN       = os.getenv("EXTENSION_TOKEN", None)  # for /ext/* endpoints
EXCLUDED_IPS_FILE     = "excluded_ips.json"  # File to store excluded IPs

APP_DIR               = os.path.dirname(os.path.abspath(__file__))
COMMENTS_FOLDER       = os.path.join(APP_DIR, "comments")
TRASH_FILE            = os.path.join(APP_DIR, "trash.json")
PHISHING_FILE         = os.path.join(APP_DIR, "phishing_emails.json")
PROFILE_UPLOAD_DIR    = os.path.join(APP_DIR, "static", "assets", "profile_images")

# Temporary password policy (admin-issued)
TEMP_PASSWORD_TTL_SECONDS   = int(os.getenv('TEMP_PASSWORD_TTL_SECONDS', '180'))  # default 3 minutes
TEMP_PASSWORD_MAX_GRANTS    = int(os.getenv('TEMP_PASSWORD_MAX_GRANTS', '4'))     # default 4 times per user


# ----------------------------
# App setup
# ----------------------------
# Configure Flask to serve its own static files and templates for login/signup/landing
app = Flask(__name__, static_folder=os.path.join(APP_DIR, 'static'), template_folder=os.path.join(APP_DIR, 'templates'))
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a_very_secret_key') # Use a strong, random key in production
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page' # Redirect to this page for login

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    flash('')
    return redirect(url_for('login_page'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    admin_reset_count = db.Column(db.Integer, nullable=False, default=0)
    profile_image = db.Column(db.String(255), nullable=True)
    # Temporary password support
    temp_password_hash = db.Column(db.String(255), nullable=True)
    temp_password_expires_at = db.Column(db.DateTime, nullable=True)
    temp_password_grants = db.Column(db.Integer, nullable=False, default=0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"
# ----------------------------
# Lightweight migration: add email column if missing
# ----------------------------
with app.app_context():
    try:
        inspector = db.inspect(db.engine)
        cols = [c['name'] for c in inspector.get_columns('user')]
        if 'email' not in cols:
            with db.engine.begin() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN email VARCHAR(120)'))
        if 'admin_reset_count' not in cols:
            with db.engine.begin() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN admin_reset_count INTEGER DEFAULT 0 NOT NULL'))
        if 'profile_image' not in cols:
            with db.engine.begin() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN profile_image VARCHAR(255)'))
        if 'temp_password_hash' not in cols:
            with db.engine.begin() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN temp_password_hash VARCHAR(255)'))
        if 'temp_password_expires_at' not in cols:
            with db.engine.begin() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN temp_password_expires_at DATETIME'))
        if 'temp_password_grants' not in cols:
            with db.engine.begin() as conn:
                conn.execute(db.text('ALTER TABLE user ADD COLUMN temp_password_grants INTEGER DEFAULT 0 NOT NULL'))
    except Exception as e:
        # Table might not exist yet; create all
        try:
            db.create_all()
        except Exception:
            pass

# ----------------------------
# Validation helpers
# ----------------------------
import re

EMAIL_REGEX = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")
PASSWORD_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*\d).{8,}$")

def is_valid_email(email: str) -> bool:
    return bool(email and EMAIL_REGEX.match(email))

def is_strong_password(password: str) -> bool:
    return bool(password and PASSWORD_REGEX.match(password))


# Ensure comments folder exists
os.makedirs(COMMENTS_FOLDER, exist_ok=True)
os.makedirs(PROFILE_UPLOAD_DIR, exist_ok=True)

def _load_trash_records():
    try:
        if os.path.isfile(TRASH_FILE):
            with open(TRASH_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return []

def _append_trash_record(record: dict):
    records = _load_trash_records()
    records.append(record)
    try:
        with open(TRASH_FILE, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to write trash file: {e}")

def _load_phishing_records():
    try:
        if os.path.isfile(PHISHING_FILE):
            with open(PHISHING_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return []

def _append_phishing_record(record: dict):
    records = _load_phishing_records()
    records.append(record)
    try:
        with open(PHISHING_FILE, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to write phishing file: {e}")

# ----------------------------
# Data structures (thread-safe)
# ----------------------------
# Deques give O(1) pops from the left as we prune old timestamps
req_log  = defaultdict(deque)   # ip -> timestamps (all requests)
resp_log = defaultdict(deque)   # ip -> timestamps (200 + 404 only)
blocked  = {}                   # ip -> {"until": datetime, "penalty": int}
lock     = threading.RLock()
blocked_history = {}            # ip -> {"attempts": int, "records": [ { .. } ]}
expired_blocks = []             # List of expired blocks for admin dashboard
today_blocks_count = 0          # Count of blocks created today
last_reset_date = datetime.now(timezone.utc).date()  # Track when we last reset daily count
excluded_ips = set()            # Set of IPs that should never be blocked

# ----------------------------
# Helpers
# ----------------------------
# ----------------------------
# Helpers
# ----------------------------
def client_ip():
    if USE_X_FORWARDED_FOR:
        xfwd = request.headers.get("X-Forwarded-For")
        if xfwd: return xfwd.split(",")[0].strip()
    return request.remote_addr or "unknown"

def now_ts(): return time.monotonic()

def prune_window(dq, window, now):
    while dq and (now - dq[0]) > window:
        dq.popleft()

def log_block(ip, reason, penalty):
    line = f"{datetime.now(timezone.utc).isoformat()} :: {ip} blocked for {penalty}s :: {reason}\n"
    with open("blocked_history.log", "a") as f:
        f.write(line)

def render_countdown(seconds_left: int):
    """Render countdown page if template exists; otherwise send minimal HTML."""
    try:
        return make_response(render_template("countdown.html", time_remaining=seconds_left), 429)
    except Exception:
        html = f"""
        <!doctype html>
        <meta charset="utf-8">
        <title>Too Many Requests</title>
        <style>body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0d1117;color:#c9d1d9;display:grid;place-items:center;height:100vh;margin:0}}
        .card{{background:#161b22;padding:24px;border-radius:12px;max-width:520px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.4)}}
        h1{{margin:0 0 10px}} .t{{font-size:40px;margin:12px 0;color:#58a6ff}}</style>
        <div class="card">
          <h1>Too many requests</h1>
          <p>Your IP is temporarily blocked due to unusual traffic.</p>
          <div class="t" id="countdown">{seconds_left}</div>
          <p>Please wait and try again.</p>
        </div>
        <script>
          let timeRemaining = {seconds_left};
          const countdownElement = document.getElementById('countdown');
          
          async function updateCountdownFromServer() {{
            try {{
              const response = await fetch('/remaining_time');
              const data = await response.json();
              timeRemaining = Math.max(0, data.remaining);
            }} catch (error) {{
              // Fallback to client-side countdown if server unreachable
              timeRemaining = Math.max(0, timeRemaining - 1);
            }}
          }}
          
          async function updateCountdown() {{
            await updateCountdownFromServer();
            countdownElement.textContent = timeRemaining + 's';
            if (timeRemaining <= 0) {{
              window.location.reload();
            }} else {{
              setTimeout(updateCountdown, 1000);
            }}
          }}
          
          updateCountdown();
        </script>
        """
        return make_response(html, 429)

def get_groq_api_key():
    """Return a sanitized Groq API key from env or request header override.
    Priority: request header X-Groq-Api-Key (for testing) -> GROQ_API_KEY -> GROQ_KEY.
    Strips quotes and whitespace.
    """
    # Allow a request override header strictly for local/testing scenarios
    hdr = request.headers.get('X-Groq-Api-Key') if request else None
    raw = hdr or os.getenv('GROQ_API_KEY') or os.getenv('GROQ_KEY')
    if not raw:
        return None
    key = raw.strip().strip('"').strip("'")
    return key or None

def get_virustotal_api_key():
    """Return VirusTotal API key from environment variables."""
    raw = os.getenv('VIRUSTOTAL_API_KEY') or os.getenv('VT_API_KEY')
    if not raw:
        return None
    key = raw.strip().strip('"').strip("'")
    return key or None

def load_excluded_ips():
    """Load excluded IPs from file"""
    global excluded_ips
    try:
        if os.path.exists(EXCLUDED_IPS_FILE):
            with open(EXCLUDED_IPS_FILE, "r") as f:
                data = json.load(f)
                excluded_ips = set(data.get("excluded_ips", []))
    except Exception as e:
        print(f"[WARN] Failed to load excluded IPs: {e}")
        excluded_ips = set()

def save_excluded_ips():
    """Save excluded IPs to file"""
    try:
        data = {"excluded_ips": list(excluded_ips)}
        with open(EXCLUDED_IPS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save excluded IPs: {e}")

def is_ip_excluded(ip: str) -> bool:
    """Check if an IP is in the exclusion list"""
    return ip in excluded_ips

def save_blocked():
    with lock:
        data = {
            "active": {
                ip: {
                    "until": info["until"].isoformat() if isinstance(info["until"], datetime) else info["until"],
                    "penalty": info["penalty"],
                    "blocks": info.get("blocks", 1),
                    "last_reason": info.get("last_reason", ""),
                    "last_block_time": info.get("last_block_time", "")
                }
                for ip, info in blocked.items()
            },
            "history": {},
            "expired": expired_blocks,
            "today_count": today_blocks_count,
            "last_reset": last_reset_date.isoformat()
        }

        # Convert history, making sure all 'until' fields are strings
        for ip, hist in blocked_history.items():
            records = []
            for rec in hist["records"]:
                rec_copy = rec.copy()
                if isinstance(rec_copy.get("until"), datetime):
                    rec_copy["until"] = rec_copy["until"].isoformat()
                records.append(rec_copy)
            data["history"][ip] = {"attempts": hist["attempts"], "records": records}

    with open(BLOCKED_IPS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def load_blocked():
    if not os.path.exists(BLOCKED_IPS_FILE):
        return
    try:
        with open(BLOCKED_IPS_FILE, "r") as f:
            data = json.load(f)

        with lock:
            global expired_blocks, today_blocks_count, last_reset_date
            
            # Load active
            for ip, info in data.get("active", {}).items():
                until = datetime.fromisoformat(info["until"])
                blocked[ip] = {
                    "until": until,
                    "penalty": info.get("penalty", BASE_BLOCK_SECONDS),
                    "blocks": info.get("blocks", 1),
                    "last_reason": info.get("last_reason", ""),
                    "last_block_time": info.get("last_block_time", "")
                }

            # Load history
            blocked_history = {}
            for ip, hist in data.get("history", {}).items():
                records = []
                for rec in hist["records"]:
                    rec_copy = rec.copy()
                    if "until" in rec_copy:
                        try:
                            rec_copy["until"] = datetime.fromisoformat(rec_copy["until"])
                        except Exception:
                            pass
                    records.append(rec_copy)
                blocked_history[ip] = {"attempts": hist["attempts"], "records": records}
            
            # Load expired blocks and daily count
            expired_blocks = data.get("expired", [])
            today_blocks_count = data.get("today_count", 0)
            
            # Check if we need to reset daily count
            try:
                saved_date = datetime.fromisoformat(data.get("last_reset", datetime.now(timezone.utc).date().isoformat())).date()
                if saved_date != datetime.now(timezone.utc).date():
                    today_blocks_count = 0
                    last_reset_date = datetime.now(timezone.utc).date()
                else:
                    last_reset_date = saved_date
            except Exception:
                last_reset_date = datetime.now(timezone.utc).date()
                
    except Exception as e:
        print(f"[WARN] Failed to load blocked IPs: {e}")


@app.route("/blocked-history")
def get_blocked_history():
    # Check if user is authenticated admin
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401

    with lock:
        history_view = blocked_history.copy()
    return jsonify(history_view), 200


load_blocked()
load_excluded_ips()
atexit.register(save_blocked)
atexit.register(save_excluded_ips)

# Initialize global variables if not loaded
if 'expired_blocks' not in globals():
    expired_blocks = []
if 'today_blocks_count' not in globals():
    today_blocks_count = 0
if 'last_reset_date' not in globals():
    last_reset_date = datetime.now(timezone.utc).date()



def is_blocked(ip: str) -> int:
    with lock:
        info = blocked.get(ip)
        if not info: return 0
        remain = int((info["until"] - datetime.now(timezone.utc)).total_seconds())
        if remain <= 0:
            # Move to expired blocks before removing
            expired_block = {
                "ip": ip,
                "penalty": info.get("penalty", 0),
                "blocks": info.get("blocks", 1),
                "reason": info.get("last_reason", "N/A"),
                "expired_at": datetime.now(timezone.utc).isoformat(),
                "last_block_time": info.get("last_block_time", "")
            }
            expired_blocks.insert(0, expired_block)
            # Keep only last 100 expired blocks
            if len(expired_blocks) > 100:
                expired_blocks.pop()
            
            blocked.pop(ip, None)
            save_blocked()
            return 0
        return remain

def block_ip(ip: str, reason: str):
    # Skip blocking for excluded IPs
    if is_ip_excluded(ip):
        return None
        
    with lock:
        global today_blocks_count, last_reset_date
        
        # Reset daily count if new day
        current_date = datetime.now(timezone.utc).date()
        if current_date != last_reset_date:
            today_blocks_count = 0
            last_reset_date = current_date
        
        # Check if IP has history for exponential blocking
        hist = blocked_history.get(ip, {"attempts": 0, "records": []})
        
        # Calculate penalty based on previous attempts (exponential: 20s, 40s, 80s, 160s, etc.)
        penalty = BASE_BLOCK_SECONDS * (BLOCK_MULTIPLIER ** hist["attempts"])
        penalty = min(penalty, MAX_BLOCK_SECONDS)
        
        # Update or create block info
        if ip in blocked:
            blocked[ip]["blocks"] += 1
        else:
            blocked[ip] = {"blocks": 1}
            today_blocks_count += 1  # Increment daily count for new IPs

        until = datetime.now(timezone.utc) + timedelta(seconds=penalty)
        block_info = {
            "until": until,
            "penalty": penalty,
            "blocks": blocked[ip]["blocks"],
            "last_reason": reason,
            "last_block_time": datetime.now(timezone.utc).isoformat()
        }
        blocked[ip].update(block_info)

        # Update history with new attempt
        hist["attempts"] += 1
        hist["records"].append(block_info)
        blocked_history[ip] = hist

    save_blocked()
    # Suggest DDOS indicator in message if penalty escalates high
    ddos_hint = " (possible DDoS)" if penalty >= MAX_BLOCK_SECONDS // 2 else ""
    try:
        app.logger.warning(f"BLOCKED {ip} - {reason}{ddos_hint} - attempts={hist['attempts']} penalty={penalty}s")
    except Exception:
        pass
    return render_countdown(penalty)


# ----------------------------
# Firewall hooks
# ----------------------------
@app.before_request
def waf_before():
    path = request.path or ""
    if path.startswith("/static/") or path.startswith("/login/assets/") or path == "/favicon.ico":
        return
    ip = client_ip()
    
    # Skip blocking for excluded IPs
    if is_ip_excluded(ip):
        return
    
    remaining = is_blocked(ip)
    if remaining > 0:
        return render_countdown(remaining)

    ts = now_ts()
    method = (request.method or 'GET').upper()
    
    with lock:
        dq = req_log[ip]
        dq.append(ts)
        prune_window(dq, WINDOW_SECONDS, ts)
        
        # Use different thresholds based on request method
        threshold = MAX_POST_REQUESTS if method == 'POST' else MAX_OTHER_REQUESTS
        
        if len(dq) >= threshold:
            if method == 'POST':
                reason = f"Brute-force: {len(dq)} POSTs in {WINDOW_SECONDS}s"
            else:
                reason = f"Flooding: {len(dq)} {method}s in {WINDOW_SECONDS}s"
            return block_ip(ip, reason)

@app.after_request
def waf_after(response):
    ip = client_ip()
    
    # Skip blocking for excluded IPs
    if is_ip_excluded(ip):
        return response
    
    status = response.status_code
    method = (request.method or 'GET').upper()
    
    if status in (200, 404):  # ✅ count both 200 and 404
        ts = now_ts()
        with lock:
            dq = resp_log[ip]
            dq.append(ts)
            prune_window(dq, WINDOW_SECONDS, ts)
            
            # Use different thresholds based on request method
            threshold = MAX_POST_REQUESTS if method == 'POST' else MAX_OTHER_REQUESTS
            
            if len(dq) >= threshold:
                if status == 404:
                    reason = f"Fuzzing: {len(dq)} 404s in {WINDOW_SECONDS}s"
                elif status == 200:
                    reason = f"Flooding: {len(dq)} 200s in {WINDOW_SECONDS}s"
                else:
                    reason = f"Excessive responses: {len(dq)} {status} in {WINDOW_SECONDS}s"
                return block_ip(ip, reason)
    return response

@app.before_request
def enforce_session_timeout():
    path = request.path or ""
    # Skip checks for public and static endpoints
    if path.startswith("/static/") or path.startswith("/login/assets/"):
        return
    if path in ("/login", "/signup", "/", "/super-admin_page", "/favicon.ico"):
        return

    lifetime = app.config.get('PERMANENT_SESSION_LIFETIME', timedelta(minutes=30))

    # Admin session timeout
    if session.get('admin'):
        last = session.get('last_activity')
        now = datetime.now(timezone.utc)
        try:
            last_dt = datetime.fromisoformat(last) if last else None
        except Exception:
            last_dt = None
        if last_dt and (now - last_dt) > lifetime:
            session.pop('admin', None)
            return redirect(url_for('admin_login'))
        session['last_activity'] = now.isoformat()
        return

    # User session timeout (Flask-Login)
    if current_user.is_authenticated:
        last = session.get('last_activity')
        now = datetime.now(timezone.utc)
        try:
            last_dt = datetime.fromisoformat(last) if last else None
        except Exception:
            last_dt = None
        if last_dt and (now - last_dt) > lifetime:
            logout_user()
            return redirect(url_for('login_page'))
        session['last_activity'] = now.isoformat()

@app.errorhandler(404)
def not_found_handler(e):
    ip = client_ip()
    remaining = is_blocked(ip)
    if remaining > 0:
        return render_countdown(remaining)

    wants_json = "application/json" in (request.headers.get("Accept") or "")
    if wants_json:
        return jsonify({"error": "Not Found", "path": request.path, "ip": ip}), 404
    
    # Try to render custom 404 template, fallback to inline HTML
    try:
        return render_template("404.html", path=request.path), 404
    except Exception:
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Page Not Found - Security Platform</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                }}
                .container {{
                    text-align: center;
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 90%;
                }}
                .error-code {{
                    font-size: 6rem;
                    font-weight: 700;
                    color: #667eea;
                    margin-bottom: 1rem;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                }}
                .error-title {{
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: #2d3748;
                }}
                .error-message {{
                    color: #718096;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }}
                .btn {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: 600;
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin: 0 10px;
                }}
                .btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }}
                .btn-outline {{
                    background: transparent;
                    color: #667eea;
                    border: 2px solid #667eea;
                }}
                .btn-outline:hover {{
                    background: #667eea;
                    color: white;
                }}
                .path-info {{
                    background: #f7fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-family: monospace;
                    color: #4a5568;
                    word-break: break-all;
                }}
                @media (max-width: 480px) {{
                    .error-code {{ font-size: 4rem; }}
                    .container {{ padding: 2rem 1rem; }}
                    .btn {{ display: block; margin: 10px 0; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-code">404</div>
                <h1 class="error-title">🔍 Page Not Found</h1>
                <p class="error-message">
                    The page you're looking for seems to have vanished into the digital void.
                    Don't worry, our security systems are still protecting you!
                </p>
                <div class="path-info">
                    Requested: {request.path}
                </div>
                <div>
                    <a href="/" class="btn">🏠 Go Home</a>
                    <a href="javascript:history.back()" class="btn btn-outline">← Go Back</a>
                </div>
            </div>
        </body>
        </html>
        """
        return make_response(html, 404)

@app.errorhandler(403)
def forbidden_handler(e):
    return jsonify({"error": "Forbidden", "message": "Access denied"}), 403

@app.errorhandler(500)
def internal_error_handler(e):
    return jsonify({"error": "Internal Server Error", "message": "Something went wrong"}), 500

# Admin password configuration
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")  # change this in production

# Admin password storage (hashed) persisted to file so it can be changed at runtime
ADMIN_SECRET_FILE = os.path.join(APP_DIR, 'admin_secret.json')

def _load_admin_secret():
    try:
        if os.path.isfile(ADMIN_SECRET_FILE):
            with open(ADMIN_SECRET_FILE, 'r', encoding='utf-8') as f:
                data = _json.load(f)
                # Support both old format (single password) and new format (dual passwords)
                if 'password_hash' in data:
                    # Old format - convert to new format
                    old_hash = data['password_hash']
                    new_data = {
                        'primary_password_hash': old_hash,
                        'secondary_password_hash': generate_password_hash('AnimPlease@123')
                    }
                    with open(ADMIN_SECRET_FILE, 'w', encoding='utf-8') as f:
                        _json.dump(new_data, f)
                    return new_data
                elif 'primary_password_hash' in data and 'secondary_password_hash' in data:
                    return data
    except Exception as e:
        print(f"[WARN] Failed to read admin secret: {e}")
    
    # Fallback: initialize both passwords and save
    new_data = {
        'primary_password_hash': generate_password_hash(ADMIN_PASSWORD),
        'secondary_password_hash': generate_password_hash('AnimPlease@123')
    }
    try:
        with open(ADMIN_SECRET_FILE, 'w', encoding='utf-8') as f:
            _json.dump(new_data, f)
    except Exception as e:
        print(f"[WARN] Failed to write admin secret: {e}")
    return new_data

def _save_admin_secret(new_password: str, is_primary: bool = True):
    """Save new admin password. If is_primary=True, updates primary password, else secondary."""
    current_data = _load_admin_secret()
    if is_primary:
        current_data['primary_password_hash'] = generate_password_hash(new_password)
    else:
        current_data['secondary_password_hash'] = generate_password_hash(new_password)
    
    with open(ADMIN_SECRET_FILE, 'w', encoding='utf-8') as f:
        _json.dump(current_data, f)
    return current_data

ADMIN_PASSWORD_DATA = _load_admin_secret()

@app.route("/super-admin_page", methods=["GET", "POST"])
@app.route("/super-admin_page/login", methods=["GET", "POST"])
def admin_login():
    # If already authenticated, show admin home
    if request.method == "GET" and session.get("admin"):
        return redirect(url_for("admin_home"))
    if request.method == "POST":
        password = request.form.get("password")
        username = request.form.get("username", "").strip()
        
        # Validate username must be exactly "admin"
        if username != "admin":
            try:
                return render_template("admin_login.html", error="Invalid username or password")
            except Exception:
                return "<h1>Admin Login</h1><p>Invalid username or password</p><a href='/super-admin_page'>Try again</a>", 401
        
        if password:
            # Check both primary and secondary passwords
            primary_hash = ADMIN_PASSWORD_DATA.get('primary_password_hash')
            secondary_hash = ADMIN_PASSWORD_DATA.get('secondary_password_hash')
            
            if (primary_hash and check_password_hash(primary_hash, password)) or \
               (secondary_hash and check_password_hash(secondary_hash, password)):
                session["admin"] = True
                session.permanent = True
                session["last_activity"] = datetime.now(timezone.utc).isoformat()
                return redirect(url_for("admin_home"))
        
        try:
            return render_template("admin_login.html", error="Invalid username or password")
        except Exception:
            return "<h1>Admin Login</h1><p>Invalid username or password</p><a href='/super-admin_page'>Try again</a>", 401
    
    try:
        return render_template("admin_login.html", error=None)
    except Exception:
        return """<h1>Admin Login</h1>
        <form method='post'>
            <p>Username: <input type='text' name='username' required></p>
            <p>Password: <input type='password' name='password' required></p>
            <p><button type='submit'>Login</button></p>
        </form>"""

@app.route("/super-admin_page/home")
def admin_home():
    if not session.get("admin"):
        return redirect(url_for("admin_login"))
    try:
        return render_template("admin_home.html")
    except Exception:
        return "<h1>Admin Dashboard</h1><p>Welcome to admin panel</p><a href='/super-admin_page/logout'>Logout</a>"

@app.route("/super-admin_page/dashboard")
def blocked_dashboard():
    if not session.get("admin"):
        return redirect(url_for("admin_login"))
    # serve the blocked.html file (place it in same folder as app.py)
    return send_from_directory(os.path.dirname(__file__), "blocked.html")

@app.route("/super-admin_page/excluded-ips")
def excluded_ips_dashboard():
    if not session.get("admin"):
        return redirect(url_for("admin_login"))
    return render_template("admin_excluded_ips.html")

@app.route("/blocked_ips.json")
def blocked_ips_json():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        # Clean up expired blocks first
        expired_ips = []
        for ip in list(blocked.keys()):
            remaining = max(0, int((blocked[ip]["until"] - datetime.now(timezone.utc)).total_seconds()))
            if remaining <= 0:
                # Move to expired
                info = blocked[ip]
                expired_block = {
                    "ip": ip,
                    "penalty": info.get("penalty", 0),
                    "blocks": info.get("blocks", 1),
                    "reason": info.get("last_reason", "N/A"),
                    "expired_at": datetime.now(timezone.utc).isoformat(),
                    "last_block_time": info.get("last_block_time", "")
                }
                expired_blocks.insert(0, expired_block)
                expired_ips.append(ip)
        
        # Remove expired IPs from active blocks
        for ip in expired_ips:
            blocked.pop(ip, None)
        
        # Keep only last 100 expired blocks
        if len(expired_blocks) > 100:
            expired_blocks[:] = expired_blocks[:100]
        
        # Build response
        blocked_view = {}
        total_blocks_today = today_blocks_count
        
        for ip, info in blocked.items():
            remaining = max(0, int((info["until"] - datetime.now(timezone.utc)).total_seconds()))
            blocked_view[ip] = {
                "penalty": info["penalty"],
                "remaining": remaining,
                "blocks": info.get("blocks", 1),
                "last_reason": info.get("last_reason", ""),
                "last_block_time": info.get("last_block_time", "")
            }
            total_blocks_today += info.get("blocks", 1)
        
        response_data = {
            "active": blocked_view,
            "expired": expired_blocks[:50],  # Return last 50 expired
            "stats": {
                "active_count": len(blocked_view),
                "total_today": total_blocks_today,
                "expired_count": len(expired_blocks)
            }
        }
    
    if expired_ips:  # Save if we moved any blocks to expired
        save_blocked()
    
    return jsonify(response_data), 200

@app.route("/block_ip", methods=["POST"])
def manual_block_ip():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    ip = data.get('ip', '').strip()
    penalty = int(data.get('penalty', 60))
    reason = data.get('reason', 'Manual block')
    
    if not ip:
        return jsonify({"error": "IP address is required"}), 400
    
    with lock:
        global today_blocks_count, last_reset_date
        
        # Reset daily count if new day
        current_date = datetime.now(timezone.utc).date()
        if current_date != last_reset_date:
            today_blocks_count = 0
            last_reset_date = current_date
        
        until = datetime.now(timezone.utc) + timedelta(seconds=penalty * 60)  # Convert minutes to seconds
        is_new_ip = ip not in blocked
        
        blocked[ip] = {
            "until": until,
            "penalty": penalty,
            "blocks": blocked.get(ip, {}).get("blocks", 0) + 1,
            "last_reason": reason,
            "last_block_time": datetime.now(timezone.utc).isoformat()
        }
        
        if is_new_ip:
            today_blocks_count += 1
    
    save_blocked()
    return jsonify({"message": f"IP {ip} blocked for {penalty} minutes"}), 200

@app.route("/clear_expired", methods=["POST"])
def clear_expired_blocks():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        global expired_blocks
        expired_blocks = []
    
    save_blocked()
    return jsonify({"message": "Expired blocks cleared"}), 200

@app.route("/unblock_all", methods=["POST"])
def unblock_all_ips():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        # Move all active blocks to expired before clearing
        for ip, info in blocked.items():
            expired_block = {
                "ip": ip,
                "penalty": info.get("penalty", 0),
                "blocks": info.get("blocks", 1),
                "reason": info.get("last_reason", "N/A") + " (Unblocked by admin)",
                "expired_at": datetime.now(timezone.utc).isoformat(),
                "last_block_time": info.get("last_block_time", "")
            }
            expired_blocks.insert(0, expired_block)
        
        # Keep only last 100 expired blocks
        if len(expired_blocks) > 100:
            expired_blocks[:] = expired_blocks[:100]
        
        # Clear all active blocks
        blocked.clear()
        req_log.clear()
        resp_log.clear()
    
    save_blocked()
    return jsonify({"message": "All IPs unblocked"}), 200

@app.route("/export_blocked_data")
def export_blocked_data():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        export_data = []
        
        # Add active blocks
        for ip, info in blocked.items():
            remaining = max(0, int((info["until"] - datetime.now(timezone.utc)).total_seconds()))
            export_data.append({
                "ip": ip,
                "status": "Active",
                "penalty": info.get("penalty", 0),
                "remaining": remaining,
                "blocks": info.get("blocks", 1),
                "reason": info.get("last_reason", "N/A"),
                "last_block_time": info.get("last_block_time", "")
            })
        
        # Add expired blocks
        for block in expired_blocks:
            export_data.append({
                "ip": block["ip"],
                "status": "Expired",
                "penalty": block.get("penalty", 0),
                "remaining": 0,
                "blocks": block.get("blocks", 1),
                "reason": block.get("reason", "N/A"),
                "last_block_time": block.get("expired_at", "")
            })
    
    return jsonify({"data": export_data}), 200

@app.route("/super-admin_page/logout")
def admin_logout():
    session.pop("admin", None)
    return redirect(url_for("admin_login"))

@app.route("/excluded_ips", methods=["GET"])
def get_excluded_ips():
    """Get list of excluded IPs (admin only)"""
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"excluded_ips": list(excluded_ips)}), 200

@app.route("/add_excluded_ip", methods=["POST"])
def add_excluded_ip():
    """Add IP to exclusion list (admin only)"""
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    ip = data.get('ip', '').strip()
    
    if not ip:
        return jsonify({"error": "IP address is required"}), 400
    
    excluded_ips.add(ip)
    save_excluded_ips()
    
    # If IP is currently blocked, unblock it
    with lock:
        if ip in blocked:
            info = blocked[ip]
            expired_block = {
                "ip": ip,
                "penalty": info.get("penalty", 0),
                "blocks": info.get("blocks", 1),
                "reason": info.get("last_reason", "N/A") + " (Added to exclusion list)",
                "expired_at": datetime.now(timezone.utc).isoformat(),
                "last_block_time": info.get("last_block_time", "")
            }
            expired_blocks.insert(0, expired_block)
            blocked.pop(ip, None)
            req_log.pop(ip, None)
            resp_log.pop(ip, None)
    
    save_blocked()
    return jsonify({"message": f"IP {ip} added to exclusion list"}), 200

@app.route("/remove_excluded_ip", methods=["POST"])
def remove_excluded_ip():
    """Remove IP from exclusion list (admin only)"""
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    ip = data.get('ip', '').strip()
    
    if not ip:
        return jsonify({"error": "IP address is required"}), 400
    
    if ip in excluded_ips:
        excluded_ips.remove(ip)
        save_excluded_ips()
        return jsonify({"message": f"IP {ip} removed from exclusion list"}), 200
    else:
        return jsonify({"error": "IP not found in exclusion list"}), 404

@app.route("/super-admin_page/change-password", methods=["GET", "POST"])
def admin_change_password():
    if not session.get("admin"):
        return redirect(url_for("admin_login"))
    
    if request.method == "GET":
        return render_template("admin_change_password.html")
    
    # POST method
    new_password = (request.form.get('new_password') or '').strip()
    confirm_password = (request.form.get('confirm_password') or '').strip()
    password_type = (request.form.get('password_type') or 'primary').strip()  # 'primary' or 'secondary'
    
    if not new_password or not confirm_password:
        return jsonify({"error": "Both password fields are required"}), 400
    if new_password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400
    if not is_strong_password(new_password):
        return jsonify({"error": "Password must be 8+ chars, include an uppercase letter and a number"}), 400
    
    global ADMIN_PASSWORD_DATA
    is_primary = (password_type == 'primary')
    ADMIN_PASSWORD_DATA = _save_admin_secret(new_password, is_primary)
    
    password_name = "Primary" if is_primary else "Secondary"
    return jsonify({"message": f"{password_name} admin password updated"}), 200

# Keep-alive endpoint to extend session while a tab remains open
@app.route('/heartbeat', methods=['POST'])
def heartbeat():
    if current_user.is_authenticated or session.get('admin'):
        session.modified = True
        return ('', 204)
    return ('', 401)

# Browser extension download
@app.route('/download/extension')
def download_extension():
    """Serve the browser extension file for download"""
    try:
        return send_from_directory(APP_DIR, 'safe-browse-guard-extension.rar', as_attachment=True)
    except FileNotFoundError:
        return "Extension file not found", 404








# ----------------------------
# App routes
# ----------------------------
@app.route("/login", methods=["GET", "POST"])
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard_page'))
    if request.method == 'POST':
        identifier = (request.form.get('username') or '').strip()
        password = request.form.get('password')
        # Allow login by username OR email
        user = User.query.filter((User.username==identifier)|(User.email==identifier)).first()
        if user:
            # First try permanent password
            if user.check_password(password):
                login_user(user)
                session.permanent = True
                session["last_activity"] = datetime.now(timezone.utc).isoformat()
                next_page = request.args.get('next')
                if next_page and urlparse(next_page).netloc == request.host:
                    return redirect(next_page)
                return redirect(url_for('dashboard_page'))

            # Then try valid temporary password (unexpired)
            if user.temp_password_hash and user.temp_password_expires_at:
                # Ensure both datetimes are timezone-aware for comparison
                expires_at = user.temp_password_expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                
                if datetime.now(timezone.utc) <= expires_at:
                    if check_password_hash(user.temp_password_hash, password):
                        # One-time use: immediately clear temp credentials
                        user.temp_password_hash = None
                        user.temp_password_expires_at = None
                        db.session.commit()
                        login_user(user)
                        session.permanent = True
                        session["last_activity"] = datetime.now(timezone.utc).isoformat()
                        session['used_temp_password'] = True
                        next_page = request.args.get('next')
                        if next_page and urlparse(next_page).netloc == request.host:
                            return redirect(next_page)
                        return redirect(url_for('dashboard_page'))

        return render_template('login/index.html', mode='login', error='Invalid username or password')
    return render_template('login/index.html', mode='login', error=None)

@app.route("/signup", methods=["GET", "POST"])
def signup_page():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard_page'))
    if request.method == 'POST':
        username = (request.form.get('username') or '').strip()
        email = (request.form.get('email') or '').strip()
        password = request.form.get('password') or ''

        if not username or not email or not password:
            return render_template('login/index.html', mode='signup', error='Username, email and password are required')

        if not is_valid_email(email):
            return render_template('login/index.html', mode='signup', error='Please enter a valid email address')

        if not is_strong_password(password):
            return render_template('login/index.html', mode='signup', error='Password must be 8+ chars, include an uppercase letter and a number')

        if User.query.filter_by(username=username).first():
            return render_template('login/index.html', mode='signup', error='Username already exists')
        if User.query.filter_by(email=email).first():
            return render_template('login/index.html', mode='signup', error='Email already exists')

        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        flash('Account created successfully! Please log in.')
        return redirect(url_for('login_page'))
    return render_template('login/index.html', mode='signup', error=None)

# Serve login template-local assets (CSS/JS) from templates/login directory
@app.route('/login/assets/styles.css')
def login_assets_css():
    return send_from_directory(os.path.join(app.template_folder, 'login'), 'styles.css')

@app.route('/login/assets/index.js')
def login_assets_js():
    return send_from_directory(os.path.join(app.template_folder, 'login'), 'index.js')

# ----------------------------
# Admin Users Dashboard (session-based admin only)
# ----------------------------
@app.route('/super-admin_page/users')
def admin_users():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return render_template('admin_users.html')

@app.route('/super-admin_page/trash')
def admin_trash():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return render_template('admin_trash.html')

@app.route('/super-admin_page/phishing-emails')
def admin_phishing_emails():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return render_template('admin_phishing_emails.html')

@app.route('/super-admin_page/users/list', methods=['GET'])
def admin_users_list():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    users = User.query.all()
    payload = [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email or '',
            'password_hash': u.password_hash,
            'admin_reset_count': u.admin_reset_count
        } for u in users
    ]
    return jsonify({'users': payload})

@app.route('/super-admin_page/trash/list', methods=['GET'])
def admin_trash_list():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'deleted_users': _load_trash_records()})

@app.route('/super-admin_page/phishing-emails/list', methods=['GET'])
def admin_phishing_list():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'phishing_emails': _load_phishing_records()})

@app.route('/api/track-phishing', methods=['POST'])
@login_required
def track_phishing():
    data = request.get_json()
    email = data.get('email', '').strip()
    content = data.get('content', '').strip()
    risk_score = data.get('risk_score', 0)
    
    if email and risk_score >= 7:
        record = {
            'email': email,
            'content': content,
            'risk_score': risk_score,
            'detected_at': datetime.now(timezone.utc).isoformat(),
            'user_id': current_user.id,
            'username': current_user.username
        }
        _append_phishing_record(record)
    
    return jsonify({'status': 'tracked'}), 200

@app.route('/api/get-phishing-emails', methods=['POST'])
@login_required
def get_phishing_emails():
    data = request.get_json()
    email = data.get('email', '').strip()
    
    if not email:
        return jsonify({'phishing_emails': []}), 200
    
    records = _load_phishing_records()
    filtered_records = [r for r in records if r.get('email') == email]
    
    return jsonify({'phishing_emails': filtered_records}), 200

@app.route('/super-admin_page/users/<int:user_id>', methods=['POST'])
def admin_users_delete(user_id: int):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Log to trash before deleting
    trash_record = {
        'id': user.id,
        'username': user.username,
        'email': user.email or '',
        'profile_image': user.profile_image or '',
        'deleted_at': datetime.now(timezone.utc).isoformat(),
        'deleted_reason': 'admin_action'
    }
    _append_trash_record(trash_record)
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/super-admin_page/users/<int:user_id>/reset-password', methods=['POST'])
def admin_reset_password(user_id: int):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json(silent=True) or {}
    new_password = data.get('new_password') or ''
    if not is_strong_password(new_password):
        return jsonify({'error': 'Password must be 8+ chars, include an uppercase letter and a number'}), 400
    user.set_password(new_password)
    # Admin change allowed any time; do not enforce once-only limit
    user.admin_reset_count = user.admin_reset_count + 0
    # Invalidate any active temporary password
    user.temp_password_hash = None
    user.temp_password_expires_at = None
    db.session.commit()
    return jsonify({'message': 'Password reset successfully'})

def _generate_temp_password(length: int = 12) -> str:
    # Ensure at least one upper, one lower, one digit
    alphabet = string.ascii_letters + string.digits
    while True:
        pwd = ''.join(secrets.choice(alphabet) for _ in range(length))
        if any(c.isupper() for c in pwd) and any(c.islower() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd

@app.route('/super-admin_page/users/<int:user_id>/set-temp-password', methods=['POST'])
def admin_set_temp_password(user_id: int):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Enforce per-user temp password grant limit
    if user.temp_password_grants >= TEMP_PASSWORD_MAX_GRANTS:
        return jsonify({'error': f'Temporary password limit reached ({TEMP_PASSWORD_MAX_GRANTS})'}), 400

    # Generate and store temp password (hashed) with expiry
    temp_plain = _generate_temp_password(12)
    user.temp_password_hash = generate_password_hash(temp_plain)
    user.temp_password_expires_at = datetime.now(timezone.utc) + timedelta(seconds=TEMP_PASSWORD_TTL_SECONDS)
    user.temp_password_grants = user.temp_password_grants + 1
    db.session.commit()
    # Return plaintext temp password so admin can share once
    return jsonify({'message': 'Temporary password set', 'temporary_password': temp_plain, 'expires_in_seconds': TEMP_PASSWORD_TTL_SECONDS, 'grants_used': user.temp_password_grants, 'grants_limit': TEMP_PASSWORD_MAX_GRANTS})

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash('')
    return redirect(url_for('login_page'))

# ----------------------------
# Profile/About Me
# ----------------------------
@app.route('/about', methods=['GET'])
@login_required
def about_me_page():
    return render_template('about.html', user=current_user)

@app.route('/api/profile/username', methods=['POST'])
@login_required
def api_update_username():
    new_username = (request.form.get('username') or '').strip()
    if not new_username:
        return jsonify({'error': 'Username is required'}), 400
    if User.query.filter(User.username==new_username, User.id!=current_user.id).first():
        return jsonify({'error': 'Username already taken'}), 400
    current_user.username = new_username
    db.session.commit()
    return jsonify({'message': 'Username updated', 'username': current_user.username})

@app.route('/api/profile/password', methods=['POST'])
@login_required
def api_update_password():
    current_password = request.form.get('current_password') or ''
    new_password = request.form.get('new_password') or ''
    confirm_password = request.form.get('confirm_password') or ''
    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400
    if new_password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400
    if not is_strong_password(new_password):
        return jsonify({'error': 'Password must be 8+ chars, include an uppercase letter and a number'}), 400
    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password updated'})

@app.route('/api/profile/image', methods=['POST'])
@login_required
def api_update_profile_image():
    if 'image' not in request.files:
        return jsonify({'error': 'Image file is required'}), 400
    file = request.files['image']
    if not file.filename:
        return jsonify({'error': 'Invalid file'}), 400
    # Simple extension allowlist
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in {'.png', '.jpg', '.jpeg', '.gif', '.webp'}:
        return jsonify({'error': 'Unsupported image type'}), 400
    safe_name = f"user_{current_user.id}_{int(time.time())}{ext}"
    save_path = os.path.join(PROFILE_UPLOAD_DIR, safe_name)
    file.save(save_path)
    # Store relative path under static
    rel_path = f"assets/profile_images/{safe_name}"
    current_user.profile_image = rel_path
    db.session.commit()
    return jsonify({'message': 'Profile image updated', 'profile_image': f"/static/{rel_path}"})

@app.route('/api/profile/delete', methods=['POST'])
@login_required
def api_delete_account():
    password = request.form.get('password') or ''
    if not current_user.check_password(password):
        return jsonify({'error': 'Password is incorrect'}), 400
    # Capture user data for trash
    record = {
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email or '',
        'profile_image': current_user.profile_image or '',
        'deleted_at': datetime.now(timezone.utc).isoformat(),
        'deleted_reason': 'user_self_delete'
    }
    _append_trash_record(record)
    uid = current_user.id
    # Delete and logout
    user_obj = User.query.get(uid)
    logout_user()
    if user_obj:
        db.session.delete(user_obj)
        db.session.commit()
    return jsonify({'message': 'Account deleted'}), 200

@app.route('/logout-with-delete', methods=['POST'])
@login_required
def logout_with_delete():
    """Logout flow that requires password and deletes the user, logging to admin trash."""
    return api_delete_account()

# Flask's main landing page (not protected)
# Landing page
@app.route("/")
def index():
    if current_user.is_authenticated:
        # Redirect authenticated users to dashboard
        return render_template("index.html", user=current_user)
    else:
        # Guests see the normal landing page
        return render_template("dashboard.html", user=current_user)

# Protected index.html page
@app.route("/index")
@login_required
def protected_index():
    # Only logged-in users can see this
    return render_template("index.html", user=current_user)

# Dashboard page (also protected)
@app.route("/dashboard")
@login_required
def dashboard_page():
    return render_template("index.html", user=current_user)

# Back to Home route (renders public landing for authenticated users as requested)
@app.route("/home")
# @login_required # I think here logging in is not necessary to get back to home. Should be able get back from anywhere, regardless of logging in or not
def back_home():
    return render_template("dashboard.html", user=current_user)

# Route to serve modules directly (for iframe loading)
@app.route("/modules/<path:module_path>")
@login_required
def serve_module(module_path):
    """Serve module assets from static/modules with graceful fallbacks.
    Examples:
      /modules/phishing-email.html -> static/modules/phishing-email/index.html
      /modules/phishing-email/index.html -> served directly
      /modules/tailgating/images/foo.jpg -> served directly
    """
    try:
        if '..' in module_path:
            return "Module not found", 404

        base_dir = os.path.join(app.static_folder, 'modules')
        # If request is for something like phishing-email.html, map to folder/index.html
        if module_path.endswith('.html') and '/' not in module_path:
            name = module_path[:-5]  # remove .html
            candidate = os.path.join(base_dir, name, 'index.html')
            if os.path.isfile(candidate):
                return send_from_directory(os.path.join(base_dir, name), 'index.html')

        # Direct serve if file exists
        candidate_path = os.path.join(base_dir, module_path)
        if os.path.isfile(candidate_path):
            # Serve relative to base_dir
            rel_dir = os.path.dirname(module_path)
            filename = os.path.basename(module_path)
            return send_from_directory(os.path.join(base_dir, rel_dir), filename)

        # Return attractive module not found page
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Module Not Found - Security Platform</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                }}
                .container {{
                    text-align: center;
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 90%;
                }}
                .error-icon {{
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: #667eea;
                }}
                .error-title {{
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: #2d3748;
                }}
                .error-message {{
                    color: #718096;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }}
                .btn {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: 600;
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin: 0 10px;
                }}
                .btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }}
                .module-info {{
                    background: #f7fafc;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-family: monospace;
                    color: #4a5568;
                    word-break: break-all;
                }}
                @media (max-width: 480px) {{
                    .container {{ padding: 2rem 1rem; }}
                    .btn {{ display: block; margin: 10px 0; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">🧩</div>
                <h1 class="error-title">Module Not Found</h1>
                <p class="error-message">
                    The security module you're looking for doesn't exist or has been moved.
                    Please check the module name and try again.
                </p>
                <div class="module-info">
                    Module: {module_path}
                </div>
            </div>
        </body>
        </html>
        """
        return make_response(html, 404)
    except Exception as e:
        # Return attractive error loading page
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Module Error - Security Platform</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #333;
                }}
                .container {{
                    text-align: center;
                    background: white;
                    padding: 3rem 2rem;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 90%;
                }}
                .error-icon {{
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: #ef4444;
                }}
                .error-title {{
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: #2d3748;
                }}
                .error-message {{
                    color: #718096;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }}
                .btn {{
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: 600;
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin: 0 10px;
                }}
                .btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
                }}
                .error-details {{
                    background: #fef2f2;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-family: monospace;
                    color: #991b1b;
                    font-size: 0.875rem;
                    word-break: break-all;
                }}
                @media (max-width: 480px) {{
                    .container {{ padding: 2rem 1rem; }}
                    .btn {{ display: block; margin: 10px 0; }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">⚠️</div>
                <h1 class="error-title">Module Loading Error</h1>
                <p class="error-message">
                    There was an error loading the security module.
                    Please try again or contact support if the problem persists.
                </p>
                <div class="error-details">
                    Error: {str(e)}
                </div>
                <div>
                    <a href="/dashboard" class="btn">🏠 Back to Dashboard</a>
                </div>
            </div>
        </body>
        </html>
        """
        return make_response(html, 404)

# API route for URL analysis with AI
@app.route("/api/analyze-url", methods=["POST"])
@login_required
def analyze_url():
    """Analyze URL using Groq AI API"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        language = data.get('language', 'english').lower()
        
        if not url:
            error_msg = "URL is required" if language == 'english' else "URL ያስፈልጋል"
            return jsonify({"error": error_msg}), 400
        
        # Get API key from environment
        api_key = get_groq_api_key()
        if not api_key:
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "Groq API key አልተዋቀረም። እባክዎ አስተዳዳሪን ያነጋግሩ።",
                    "recommendations": ["የ AI ትንተና ለማዋቀር የ IT ድጋፍ ያነጋግሩ"]
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": "Groq API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure AI analysis"]
            }), 500
        
        # Prepare system message based on language
        if language == 'amharic':
            system_content = 'You are an AI URL security analyzer. Return ONLY valid JSON in the following format and respond in Amharic language:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "በአማርኛ አጭር ማብራሪያ",\n  "recommendations": ["በአማርኛ ደረጃ 1", "በአማርኛ ደረጃ 2"]\n}'
            user_content = f'በአማርኛ ይህን URL ለተንኮል አዘል ወይም ለ phishing ዓላማ ተንትን: {url}'
        else:
            system_content = 'You are an AI URL security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
            user_content = f'Analyze this URL for malicious or phishing intent: {url}'
        
        # Make request to Groq API
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'moonshotai/kimi-k2-instruct-0905',
                'messages': [
                    {
                        'role': 'system',
                        'content': system_content
                    },
                    {
                        'role': 'user',
                        'content': user_content
                    }
                ],
                'temperature': 0.2,
                'response_format': { 'type': 'json_object' }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            # Try to surface Groq error body to client for debugging
            try:
                err_body = response.json()
            except Exception:
                err_body = {'message': response.text[:500]}
            if response.status_code == 401:
                if language == 'amharic':
                    return jsonify({
                        "risk_score": -1,
                        "reasoning": "ልክ ያልሆነ API ቁልፍ",
                        "details": err_body,
                        "recommendations": ["በ server .env ውስጥ GROQ_API_KEY ያዘምኑ"]
                    }), 401
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "Invalid API Key",
                    "details": err_body,
                    "recommendations": ["Update GROQ_API_KEY in server .env"]
                }), 401
            
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": f"API ስህተት: {response.status_code}",
                    "details": err_body,
                    "recommendations": ["በኋላ እንደገና ይሞክሩ ወይም የቁልፍ ቃል ትንተና ይጠቀሙ"]
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": f"API error: {response.status_code}",
                "details": err_body,
                "recommendations": ["Try again later or use keyword analysis"]
            }), 500
        
        result = response.json()
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        
        try:
            parsed = json.loads(ai_response)
            return jsonify({
                "risk_score": parsed.get('risk_score', -1),
                "reasoning": parsed.get('reasoning', 'ምንም ማብራሪያ አልተሰጠም' if language == 'amharic' else 'No reasoning provided'),
                "recommendations": parsed.get('recommendations', [])
            })
        except json.JSONDecodeError:
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "ልክ ያልሆነ AI ምላሽ ቅርጸት",
                    "recommendations": ["በምትኩ የቁልፍ ቃል ትንተና ይሞክሩ"]
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": "Invalid AI response format",
                "recommendations": ["Try keyword analysis instead"]
            }), 500
            
    except Exception as e:
        if language == 'amharic':
            return jsonify({
                "risk_score": -1,
                "reasoning": f"ስህተት: {str(e)}",
                "recommendations": ["በኋላ እንደገና ይሞክሩ ወይም የቁልፍ ቃል ትንተና ይጠቀሙ"]
            }), 500
        return jsonify({
            "risk_score": -1,
            "reasoning": f"Error: {str(e)}",
            "recommendations": ["Try again later or use keyword analysis"]
        }), 500

# Token-protected endpoint for browser extension (no login required)
@app.route("/ext/analyze-url", methods=["POST"])
def ext_analyze_url():
    token = request.headers.get("X-Extension-Token")
    if not EXTENSION_TOKEN or token != EXTENSION_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        if not url:
            return jsonify({"error": "URL is required"}), 400
        api_key = get_groq_api_key()
        if not api_key:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Groq API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure AI analysis"]
            }), 500
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'moonshotai/kimi-k2-instruct-0905',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an AI URL security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
                    },
                    {
                        'role': 'user',
                        'content': f'Analyze this URL for malicious or phishing intent: {url}'
                    }
                ],
                'temperature': 0.2,
                'response_format': { 'type': 'json_object' }
            },
            timeout=30
        )
        if response.status_code != 200:
            try:
                err_body = response.json()
            except Exception:
                err_body = {'message': response.text[:500]}
            return jsonify({
                "risk_score": -1,
                "reasoning": f"API error: {response.status_code}",
                "details": err_body,
                "recommendations": ["Try again later or use keyword analysis"]
            }), 500
        result = response.json()
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        try:
            parsed = json.loads(ai_response)
            return jsonify({
                "risk_score": parsed.get('risk_score', -1),
                "reasoning": parsed.get('reasoning', 'No reasoning provided'),
                "recommendations": parsed.get('recommendations', [])
            })
        except json.JSONDecodeError:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Invalid AI response format",
                "recommendations": ["Try keyword analysis instead"]
            }), 500
    except Exception as e:
        return jsonify({
            "risk_score": -1,
            "reasoning": f"Error: {str(e)}",
            "recommendations": ["Try again later or use keyword analysis"]
        }), 500

# API route for email analysis with AI
@app.route("/api/analyze-email", methods=["POST"])
@login_required
def analyze_email():
    """Analyze email using Groq AI API"""
    try:
        data = request.get_json()
        email_account = data.get('email_account', '').strip()
        email_content = data.get('email_content', '').strip()
        language = data.get('language', 'english').lower()
        
        if not email_account and not email_content:
            error_msg = "Email account or content is required" if language == 'english' else "የኢሜይል አካውንት ወይም ዝስጥ ያስፈልጋል"
            return jsonify({"error": error_msg}), 400
        
        # Get API key from environment
        api_key = get_groq_api_key()
        if not api_key:
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "Groq API key አልተዋቀረም። እባክዎ አስተዳዳሪን ያነጋግሩ።",
                    "recommendations": ["የ AI ትንተና ለማዋቀር የ IT ድጋፏ ያነጋግሩ"]
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": "Groq API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure AI analysis"]
            }), 500
        
        # Prepare system message based on language
        if language == 'amharic':
            system_content = 'You are an AI email security analyzer. Return ONLY valid JSON in the following format and respond in Amharic language:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "በአማርኛ አጭር ማብራሪያ",\n  "recommendations": ["በአማርኛ ደረጃ 1", "በአማርኛ ደረጃ 2"]\n}'
            user_content = f'በአማርኛ ይህን ኢሜይል ለ phishing እና ተንኮል ዓላማ ተንትን:\nየኢሜይል አካውንት: {email_account}\nየኢሜይል ዝስጥ: {email_content}'
        else:
            system_content = 'You are an AI email security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
            user_content = f'Analyze this email for phishing and malicious intent:\nEmail Account: {email_account}\nEmail Content: {email_content}'
        
        # Make request to Groq API
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'moonshotai/kimi-k2-instruct-0905',
                'messages': [
                    {
                        'role': 'system',
                        'content': system_content
                    },
                    {
                        'role': 'user',
                        'content': user_content
                    }
                ],
                'temperature': 0.2,
                'response_format': { 'type': 'json_object' }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            try:
                err_body = response.json()
            except Exception:
                err_body = {'message': response.text[:500]}
            if response.status_code == 401:
                if language == 'amharic':
                    return jsonify({
                        "risk_score": -1,
                        "reasoning": "ልክ ያልሆነ API ቁልፍ",
                        "details": err_body,
                        "recommendations": ["በ server .env ውስጥ GROQ_API_KEY ያዘምኑ"]
                    }), 401
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "Invalid API Key",
                    "details": err_body,
                    "recommendations": ["Update GROQ_API_KEY in server .env"]
                }), 401
            
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": f"API ስህተት: {response.status_code}",
                    "recommendations": ["በኋላ እንደገና ይሞክሩ ወይም የቁልፍ ቃል ትንተና ይጠቀሙ"],
                    "details": err_body
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": f"API error: {response.status_code}",
                "recommendations": ["Try again later or use keyword analysis"],
                "details": err_body
            }), 500
        
        result = response.json()
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        
        try:
            parsed = json.loads(ai_response)
            return jsonify({
                "risk_score": parsed.get('risk_score', -1),
                "reasoning": parsed.get('reasoning', 'ምንም ማብራሪያ አልተሰጠም' if language == 'amharic' else 'No reasoning provided'),
                "recommendations": parsed.get('recommendations', [])
            })
        except json.JSONDecodeError:
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "ልክ ያልሆነ AI ምላሽ ቅርጸት",
                    "recommendations": ["የቁልፍ ቃል ትንተና ይሞክሩ"]
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": "Invalid AI response format",
                "recommendations": ["Try keyword analysis instead"]
            }), 500
            
    except Exception as e:
        if language == 'amharic':
            return jsonify({
                "risk_score": -1,
                "reasoning": f"ስህተት: {str(e)}",
                "recommendations": ["በኋላ እንደገና ይሞክሩ ወይም የቁልፍ ቃል ትንተና ይጠቀሙ"]
            }), 500
        return jsonify({
            "risk_score": -1,
            "reasoning": f"Error: {str(e)}",
            "recommendations": ["Try again later or use keyword analysis"]
        }), 500

# Token-protected endpoint for browser extension (no login required)
@app.route("/ext/analyze-email", methods=["POST"])
def ext_analyze_email():
    token = request.headers.get("X-Extension-Token")
    if not EXTENSION_TOKEN or token != EXTENSION_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = request.get_json()
        email_account = data.get('email_account', '').strip()
        email_content = data.get('email_content', '').strip()
        if not email_account and not email_content:
            return jsonify({"error": "Email account or content is required"}), 400
        api_key = get_groq_api_key()
        if not api_key:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Groq API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure AI analysis"]
            }), 500
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'moonshotai/kimi-k2-instruct-0905',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an AI email security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
                    },
                    {
                        'role': 'user',
                        'content': f'Analyze this email for phishing and malicious intent:\nEmail Account: {email_account}\nEmail Content: {email_content}'
                    }
                ],
                'temperature': 0.2,
                'response_format': { 'type': 'json_object' }
            },
            timeout=30
        )
        if response.status_code != 200:
            try:
                err_body = response.json()
            except Exception:
                err_body = {'message': response.text[:500]}
            if response.status_code == 401:
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "Invalid API Key",
                    "details": err_body,
                    "recommendations": ["Update GROQ_API_KEY in server .env"]
                }), 401
            return jsonify({
                "risk_score": -1,
                "reasoning": f"API error: {response.status_code}",
                "recommendations": ["Try again later or use keyword analysis"],
                "details": err_body
            }), 500
        result = response.json()
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        try:
            parsed = json.loads(ai_response)
            return jsonify({
                "risk_score": parsed.get('risk_score', -1),
                "reasoning": parsed.get('reasoning', 'No reasoning provided'),
                "recommendations": parsed.get('recommendations', [])
            })
        except json.JSONDecodeError:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Invalid AI response format",
                "recommendations": ["Try keyword analysis instead"]
            }), 500
    except Exception as e:
        return jsonify({
            "risk_score": -1,
            "reasoning": f"Error: {str(e)}",
            "recommendations": ["Try again later or use keyword analysis"]
        }), 500

# API route for file analysis with VirusTotal
@app.route("/api/analyze-file", methods=["POST"])
@login_required
def analyze_file():
    """Analyze file using VirusTotal API"""
    try:
        language = request.form.get('language', 'english').lower()
        
        if 'file' not in request.files:
            error_msg = "No file provided" if language == 'english' else "ምንም ፋይል አልተሰጠም"
            return jsonify({"error": error_msg}), 400
        
        file = request.files['file']
        if file.filename == '':
            error_msg = "No file selected" if language == 'english' else "ምንም ፋይል አልተመረጠም"
            return jsonify({"error": error_msg}), 400
        
        # Get file info
        file_name = file.filename
        _, ext = os.path.splitext(file_name)
        file_extension = (ext or '').lower()
        
        # Read file content and calculate hash
        file_content = file.read()
        file_size = len(file_content)
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Get VirusTotal API key
        vt_api_key = get_virustotal_api_key()
        if not vt_api_key:
            if language == 'amharic':
                return jsonify({
                    "risk_score": -1,
                    "reasoning": "VirusTotal API key አልተዋቀረም። እባክዎ አስተዳዳሪን ያነጋግሩ።",
                    "recommendations": ["የ VirusTotal ትንተና ለማዋቀር የ IT ድጋፍ ያነጋግሩ"],
                    "file_info": {"fileName": file_name, "extension": file_extension, "size": f"{file_size} bytes", "hash": file_hash}
                }), 500
            return jsonify({
                "risk_score": -1,
                "reasoning": "VirusTotal API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure VirusTotal analysis"],
                "file_info": {"fileName": file_name, "extension": file_extension, "size": f"{file_size} bytes", "hash": file_hash}
            }), 500
        
        # First, check if file hash exists in VirusTotal database
        headers = {'x-apikey': vt_api_key}
        
        # Check file report by hash
        report_response = requests.get(
            f'https://www.virustotal.com/api/v3/files/{file_hash}',
            headers=headers,
            timeout=30
        )
        
        if report_response.status_code == 200:
            # File exists in VT database
            report_data = report_response.json()
            stats = report_data.get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
            
            malicious = stats.get('malicious', 0)
            suspicious = stats.get('suspicious', 0)
            total_engines = sum(stats.values())
            
            # Calculate risk score (0-10)
            if total_engines > 0:
                risk_percentage = ((malicious + suspicious * 0.5) / total_engines) * 100
                risk_score = min(10, int(risk_percentage / 10))
            else:
                risk_score = 0
            
            # Generate response based on language
            if language == 'amharic':
                if risk_score >= 7:
                    reasoning = f"ይህ ፋይል በ {malicious} ከ {total_engines} ጸረ-ቫይረስ ሞተሮች እንደ ተንኮል ተለይቷል"
                    recommendations = ["ይህን ፋይል አይክፈቱ", "ፋይሉን ወዲያውኑ ይሰርዙ", "ለ IT ደህንነት ሪፖርት ያድርጉ"]
                elif risk_score >= 4:
                    reasoning = f"ይህ ፋይል በ {malicious + suspicious} ሞተሮች እንደ አጠራጣሪ ተለይቷል"
                    recommendations = ["በጥንቃቄ ይጠቀሙ", "ከመክፈት በፊት ተጨማሪ ምርመራ ያድርጉ"]
                else:
                    reasoning = f"ይህ ፋይል በአብዛኛዎቹ ሞተሮች ({total_engines - malicious - suspicious} ከ {total_engines}) እንደ ንጹህ ተለይቷል"
                    recommendations = ["ፋይሉ በአጠቃላይ ደህንነቱ የተጠበቀ ይመስላል"]
            else:
                if risk_score >= 7:
                    reasoning = f"File detected as malicious by {malicious} out of {total_engines} antivirus engines"
                    recommendations = ["Do not open this file", "Delete the file immediately", "Report to IT security"]
                elif risk_score >= 4:
                    reasoning = f"File flagged as suspicious by {malicious + suspicious} engines"
                    recommendations = ["Use with caution", "Perform additional scanning before opening"]
                else:
                    reasoning = f"File appears clean according to most engines ({total_engines - malicious - suspicious} out of {total_engines})"
                    recommendations = ["File appears to be safe"]
            
            return jsonify({
                "risk_score": risk_score,
                "reasoning": reasoning,
                "recommendations": recommendations,
                "file_info": {
                    "fileName": file_name,
                    "extension": file_extension,
                    "size": f"{file_size} bytes",
                    "hash": file_hash
                },
                "vt_stats": {
                    "malicious": malicious,
                    "suspicious": suspicious,
                    "clean": stats.get('harmless', 0),
                    "total_engines": total_engines
                }
            })
        
        elif report_response.status_code == 404:
            # File not in VT database, upload for analysis
            if file_size > 32 * 1024 * 1024:  # 32MB limit for VT
                error_msg = "File too large for analysis (max 32MB)" if language == 'english' else "ፋይሉ ለትንተና በጣም ትልቅ ነው (ከ 32MB በላይ)"
                return jsonify({"error": error_msg}), 400
            
            # Upload file to VirusTotal
            files = {'file': (file_name, file_content)}
            upload_response = requests.post(
                'https://www.virustotal.com/api/v3/files',
                headers=headers,
                files=files,
                timeout=60
            )
            
            if upload_response.status_code == 200:
                upload_data = upload_response.json()
                analysis_id = upload_data.get('data', {}).get('id')
                
                if language == 'amharic':
                    return jsonify({
                        "risk_score": 0,
                        "reasoning": "ፋይሉ ለትንተና ወደ VirusTotal ተልኳል። ውጤቱ በ 2-3 ደቂቃ ውስጥ ይገኛል።",
                        "recommendations": ["እባክዎ ትንሽ ይጠብቁ እና እንደገና ይሞክሩ"],
                        "file_info": {
                            "fileName": file_name,
                            "extension": file_extension,
                            "size": f"{file_size} bytes",
                            "hash": file_hash
                        },
                        "analysis_id": analysis_id,
                        "status": "uploaded"
                    })
                else:
                    return jsonify({
                        "risk_score": 0,
                        "reasoning": "File uploaded to VirusTotal for analysis. Results will be available in 2-3 minutes.",
                        "recommendations": ["Please wait and try again in a few minutes"],
                        "file_info": {
                            "fileName": file_name,
                            "extension": file_extension,
                            "size": f"{file_size} bytes",
                            "hash": file_hash
                        },
                        "analysis_id": analysis_id,
                        "status": "uploaded"
                    })
            else:
                error_msg = "Failed to upload file to VirusTotal" if language == 'english' else "ፋይሉን ወደ VirusTotal መላክ አልተሳካም"
                return jsonify({"error": error_msg}), 500
        
        else:
            # API error
            error_msg = f"VirusTotal API error: {report_response.status_code}" if language == 'english' else f"የ VirusTotal API ስህተት: {report_response.status_code}"
            return jsonify({"error": error_msg}), 500
            
    except Exception as e:
        error_msg = f"Error: {str(e)}" if language == 'english' else f"ስህተት: {str(e)}"
        return jsonify({
            "risk_score": -1,
            "reasoning": error_msg,
            "recommendations": ["Try again later" if language == 'english' else "በኋላ እንደገና ይሞክሩ"],
            "file_info": {"fileName": "unknown", "extension": "unknown", "size": "unknown"}
        }), 500



# API route for pretexting analysis with AI
@app.route("/api/analyze-pretexting", methods=["POST"])
@login_required
def analyze_pretexting():
    """Analyze pretexting request using Groq AI API"""
    try:
        data = request.get_json()
        request_data = data.get('request_data', {})
        filled_fields_count = data.get('filled_fields_count', 0)
        
        if filled_fields_count == 0:
            return jsonify({"error": "No data provided for analysis"}), 400
        
        # Get API key from environment
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Groq API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure AI analysis"]
            }), 500
        
        # Make request to Groq API
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'moonshotai/kimi-k2-instruct-0905',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an AI pretexting security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
                    },
                    {
                        'role': 'user',
                        'content': f'Analyze this pretexting request for security risks:\nRequest Data: {json.dumps(request_data)}\nFilled Fields Count: {filled_fields_count}'
                    }
                ],
                'temperature': 0.2,
                'response_format': { 'type': 'json_object' }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            try:
                err_body = response.json()
            except Exception:
                err_body = {'message': response.text[:500]}
            return jsonify({
                "risk_score": -1,
                "reasoning": f"API error: {response.status_code}",
                "recommendations": ["Try again later"],
                "details": err_body
            }), 500
        
        result = response.json()
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        
        try:
            parsed = json.loads(ai_response)
            return jsonify({
                "risk_score": parsed.get('risk_score', -1),
                "reasoning": parsed.get('reasoning', 'No reasoning provided'),
                "recommendations": parsed.get('recommendations', [])
            })
        except json.JSONDecodeError:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Invalid AI response format",
                "recommendations": ["Try again later"]
            }), 500
            
    except Exception as e:
        return jsonify({
            "risk_score": -1,
            "reasoning": f"Error: {str(e)}",
            "recommendations": ["Try again later"]
        }), 500





@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()
    if not name or not email or not message:
        return jsonify({"error": "All fields are required."}), 400

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%S")
    path = os.path.join(COMMENTS_FOLDER, f"comment-{ts}.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"Name: {name}\nEmail: {email}\nMessage: {message}\n")
    return jsonify({"message": "Message received!"}), 200

# Status endpoint for admins/monitoring
@app.route("/status")
def status():
    # Check if user is authenticated admin
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    summary = {
        "windowSeconds": WINDOW_SECONDS,
        "maxPostRequests": MAX_POST_REQUESTS,
        "maxOtherRequests": MAX_OTHER_REQUESTS,
    }

    with lock:
        blocked_view = {
            ip: {
                "penalty": info["penalty"],
                "remaining": max(0, int((info["until"] - datetime.now(timezone.utc)).total_seconds())),
                "blocks": info.get("blocks", 1),
                "last_reason": info.get("last_reason", ""),
                "last_block_time": info.get("last_block_time", "")
            }
            for ip, info in blocked.items()
        }
        req_counts = {ip: len(dq) for ip, dq in req_log.items()}
        resp_counts = {ip: len(dq) for ip, dq in resp_log.items()}

    summary.update({
        "blocked": blocked_view,
        "reqCounts": req_counts,
        "respCounts": resp_counts,
        "excluded_ips": list(excluded_ips),
        "stats": {
            "active_count": len(blocked_view),
            "total_today": today_blocks_count,
            "expired_count": len(expired_blocks),
            "excluded_count": len(excluded_ips)
        }
    })
    return jsonify(summary), 200


# Get remaining time for current IP (server-synced countdown)
@app.route("/remaining_time")
def remaining_time():
    ip = client_ip()
    remaining = is_blocked(ip)
    return jsonify({"remaining": remaining}), 200

# Get remaining time for specific IP (admin use)
@app.route("/remaining_time/<ip>")
def remaining_time_for_ip(ip):
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        info = blocked.get(ip)
        if not info:
            return jsonify({"remaining": 0}), 200
        remain = int((info["until"] - datetime.now(timezone.utc)).total_seconds())
        return jsonify({"remaining": max(0, remain)}), 200

# Manual unblock endpoint for admins
@app.route("/unblock/<ip>", methods=["POST"])
def unblock(ip):
    # Check if user is authenticated admin
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        # Move to expired before removing if it exists
        if ip in blocked:
            info = blocked[ip]
            expired_block = {
                "ip": ip,
                "penalty": info.get("penalty", 0),
                "blocks": info.get("blocks", 1),
                "reason": info.get("last_reason", "N/A") + " (Unblocked by admin)",
                "expired_at": datetime.now(timezone.utc).isoformat(),
                "last_block_time": info.get("last_block_time", "")
            }
            expired_blocks.insert(0, expired_block)
            
            # Keep only last 100 expired blocks
            if len(expired_blocks) > 100:
                expired_blocks.pop()
        
        blocked.pop(ip, None)
        req_log.pop(ip, None)
        resp_log.pop(ip, None)
    
    save_blocked()
    return jsonify({"message": f"Unblocked {ip}"}), 200

# ----------------------------
# Run
# ----------------------------
if __name__ == "__main__":
    # host=0.0.0.0 lets other devices on your LAN reach it
    app.run(debug=True, host="0.0.0.0", port=2000, threaded=True)
