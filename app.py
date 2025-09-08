from flask import Flask, request, jsonify, render_template, make_response, redirect, url_for, flash, send_from_directory, get_flashed_messages
from flask_cors import CORS
from collections import defaultdict, deque
from datetime import datetime, timedelta
import threading, time, json, os, atexit
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_user, logout_user, login_required, current_user
from dotenv import load_dotenv
from urllib.parse import urlparse
import requests
from flask import Flask, request, jsonify, render_template_string, redirect, url_for, session, send_from_directory
from datetime import datetime, timedelta
import os
import json as _json
import secrets
import string

# Load environment variables from a .env file in the same directory as this app.py
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))


# ----------------------------
# Config (tune to your needs)
# ----------------------------
WINDOW_SECONDS        = 9
MAX_REQUESTS_WINDOW   = 15           # 15 requests in 5s = block
BASE_BLOCK_SECONDS    = 20
BLOCK_MULTIPLIER      = 2
MAX_BLOCK_SECONDS     = 10 * 60      # 10 minutes
TEMP_PASS             = 3
BLOCKED_IPS_FILE      = "blocked_ips.json"
USE_X_FORWARDED_FOR   = True         # honor X-Forwarded-For when behind a proxy
ADMIN_TOKEN           = os.getenv("ADMIN_TOKEN", None)  # optional for /unblock
EXTENSION_TOKEN       = os.getenv("EXTENSION_TOKEN", None)  # for /ext/* endpoints

APP_DIR               = os.path.dirname(os.path.abspath(__file__))
COMMENTS_FOLDER       = os.path.join(APP_DIR, "comments")
TRASH_FILE            = os.path.join(APP_DIR, "trash.json")
PROFILE_UPLOAD_DIR    = os.path.join(APP_DIR, "static", "assets", "profile_images")


# ----------------------------
# App setup
# ----------------------------
# Configure Flask to serve its own static files and templates for login/signup/landing
app = Flask(__name__, static_folder=os.path.join(APP_DIR, 'static'), template_folder=os.path.join(APP_DIR, 'templates'))
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'a_very_secret_key') # Use a strong, random key in production
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login_page' # Redirect to this page for login

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    flash('You must be logged in to view that page.')
    return redirect(url_for('login_page'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    admin_reset_count = db.Column(db.Integer, nullable=False, default=0)
    profile_image = db.Column(db.String(255), nullable=True)

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

# ----------------------------
# Data structures (thread-safe)
# ----------------------------
# Deques give O(1) pops from the left as we prune old timestamps
req_log  = defaultdict(deque)   # ip -> timestamps (all requests)
resp_log = defaultdict(deque)   # ip -> timestamps (200 + 404 only)
blocked  = {}                   # ip -> {"until": datetime, "penalty": int}
lock     = threading.RLock()
blocked_history = {}            # ip -> {"attempts": int, "records": [ { .. } ]}

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
    line = f"{datetime.utcnow().isoformat()} :: {ip} blocked for {penalty}s :: {reason}\n"
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
          <div class="t" id="t">{seconds_left}s</div>
          <p>Please wait and try again.</p>
        </div>
        <script>
          let s={seconds_left};
          const el=document.getElementById('t');
          const i=setInterval(()=>{{ s--; el.textContent=s+'s'; if(s<=0) clearInterval(i); }},1000);
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
            "history": {}
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
            global blocked_history
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
atexit.register(save_blocked)



def is_blocked(ip: str) -> int:
    with lock:
        info = blocked.get(ip)
        if not info: return 0
        remain = int((info["until"] - datetime.utcnow()).total_seconds())
        if remain <= 0:
            blocked.pop(ip, None)
            return 0
        return remain

def block_ip(ip: str, reason: str):
    with lock:
        penalty = BASE_BLOCK_SECONDS
        if ip in blocked:
            penalty = min(blocked[ip]["penalty"] * BLOCK_MULTIPLIER, MAX_BLOCK_SECONDS)
            blocked[ip]["blocks"] += 1
        else:
            blocked[ip] = {"blocks": 1}

        until = datetime.utcnow() + timedelta(seconds=penalty)
        block_info = {
            "until": until,
            "penalty": penalty,
            "blocks": blocked[ip]["blocks"],
            "last_reason": reason,
            "last_block_time": datetime.utcnow().isoformat()
        }
        blocked[ip].update(block_info)

        # ✅ Update history (keep old records too)
        hist = blocked_history.get(ip, {"attempts": 0, "records": []})
        hist["attempts"] += 1
        hist["records"].append(block_info)
        blocked_history[ip] = hist

    save_blocked()
    try:
        app.logger.warning(f"BLOCKED {ip} - {reason} - attempts={hist['attempts']} penalty={penalty}s")
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
    remaining = is_blocked(ip)
    if remaining > 0:
        return render_countdown(remaining)

    ts = now_ts()
    with lock:
        dq = req_log[ip]
        dq.append(ts)
        prune_window(dq, WINDOW_SECONDS, ts)
        if len(dq) >= MAX_REQUESTS_WINDOW:
            return block_ip(ip, f"Flooding: {len(dq)} req in {WINDOW_SECONDS}s")

@app.after_request
def waf_after(response):
    ip = client_ip()
    status = response.status_code
    if status in (200, 404):  # ✅ count both 200 and 404
        ts = now_ts()
        with lock:
            dq = resp_log[ip]
            dq.append(ts)
            prune_window(dq, WINDOW_SECONDS, ts)
            if len(dq) >= MAX_REQUESTS_WINDOW:
                return block_ip(ip, f"Too many {status} in {WINDOW_SECONDS}s")
    return response

@app.before_request
def enforce_session_timeout():
    path = request.path or ""
    # Skip checks for public and static endpoints
    if path.startswith("/static/") or path.startswith("/login/assets/"):
        return
    if path in ("/login", "/signup", "/", "/admin", "/favicon.ico"):
        return

    lifetime = app.config.get('PERMANENT_SESSION_LIFETIME', timedelta(minutes=30))

    # Admin session timeout
    if session.get('admin'):
        last = session.get('last_activity')
        now = datetime.utcnow()
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
        now = datetime.utcnow()
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
    msg = {"error": "Not Found", "path": request.path, "ip": ip}
    return (jsonify(msg), 404) if wants_json else (f"Not Found: {request.path}", 404)



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

@app.route("/admin", methods=["GET", "POST"])
def admin_login():
    # If already authenticated, show admin home
    if request.method == "GET" and session.get("admin"):
        return render_template("admin_home.html")
    if request.method == "POST":
        password = request.form.get("password")
        if password:
            # Check both primary and secondary passwords
            primary_hash = ADMIN_PASSWORD_DATA.get('primary_password_hash')
            secondary_hash = ADMIN_PASSWORD_DATA.get('secondary_password_hash')
            
            if (primary_hash and check_password_hash(primary_hash, password)) or \
               (secondary_hash and check_password_hash(secondary_hash, password)):
                session["admin"] = True
                session.permanent = True
                session["last_activity"] = datetime.utcnow().isoformat()
                return redirect(url_for("admin_login"))
        
        return render_template("admin_login.html", error="Invalid password")
    return render_template("admin_login.html", error=None)

@app.route("/admin/dashboard")
def blocked_dashboard():
    if not session.get("admin"):
        return redirect(url_for("admin_login"))
    # serve the blocked.html file (place it in same folder as app.py)
    return send_from_directory(os.path.dirname(__file__), "blocked.html")

@app.route("/admin/logout")
def admin_logout():
    session.pop("admin", None)
    return redirect(url_for("admin_login"))

@app.route("/admin/change-password", methods=["POST"])
def admin_change_password():
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
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
        if user and user.check_password(password):
            login_user(user)
            session.permanent = True
            session["last_activity"] = datetime.utcnow().isoformat()
            next_page = request.args.get('next')
            if next_page and urlparse(next_page).netloc == request.host:
                return redirect(next_page)
            return redirect(url_for('dashboard_page'))
        else:
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
@app.route('/admin/users', methods=['GET'])
def admin_users_page():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return render_template('admin_users.html')

@app.route('/admin/trash', methods=['GET'])
def admin_trash_page():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return send_from_directory(os.path.dirname(__file__), os.path.join('templates', 'admin_trash.html'))

@app.route('/admin/trash.html', methods=['GET'])
def admin_trash_page_html():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    return send_from_directory(os.path.dirname(__file__), os.path.join('templates', 'admin_trash.html'))

@app.route('/admin/users/list', methods=['GET'])
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

@app.route('/admin/trash/list', methods=['GET'])
def admin_trash_list():
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'deleted_users': _load_trash_records()})

@app.route('/admin/users/<int:user_id>', methods=['POST'])
def admin_users_delete(user_id: int):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Optional: prevent deleting currently logged in user if desired
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/admin/users/<int:user_id>/reset-password', methods=['POST'])
def admin_reset_password(user_id: int):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.admin_reset_count >= TEMP_PASS:
        return jsonify({'error': 'Password can only be reset by admin once'}), 400
    data = request.get_json(silent=True) or {}
    new_password = data.get('new_password') or ''
    if not is_strong_password(new_password):
        return jsonify({'error': 'Password must be 8+ chars, include an uppercase letter and a number'}), 400
    user.set_password(new_password)
    user.admin_reset_count = user.admin_reset_count + 1
    db.session.commit()
    return jsonify({'message': 'Password reset successfully'})

def _generate_temp_password(length: int = 12) -> str:
    # Ensure at least one upper, one lower, one digit
    alphabet = string.ascii_letters + string.digits
    while True:
        pwd = ''.join(secrets.choice(alphabet) for _ in range(length))
        if any(c.isupper() for c in pwd) and any(c.islower() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd

@app.route('/admin/users/<int:user_id>/set-temp-password', methods=['POST'])
def admin_set_temp_password(user_id: int):
    if not session.get('admin'):
        return jsonify({'error': 'Unauthorized'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.admin_reset_count >= TEMP_PASS:
        return jsonify({'error': 'Password can only be reset by admin once'}), 400
    temp = _generate_temp_password(12)
    user.set_password(temp)
    user.admin_reset_count = user.admin_reset_count + 1
    db.session.commit()
    # Return plaintext temp password so admin can share once
    return jsonify({'message': 'Temporary password set', 'temporary_password': temp})

@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash('You have been logged out.')
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
        'email': current_user.email,
        'profile_image': current_user.profile_image,
        'deleted_at': datetime.utcnow().isoformat(),
        'deleted_reason': 'user_requested_logout'
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
        return render_template("index1.html", user=current_user)

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
@login_required
def back_home():
    return render_template("index1.html", user=current_user)

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

        return "Module not found", 404
    except Exception as e:
        return f"Error loading module: {str(e)}", 404

# API route for URL analysis with AI
@app.route("/api/analyze-url", methods=["POST"])
@login_required
def analyze_url():
    """Analyze URL using Groq AI API"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({"error": "URL is required"}), 400
        
        # Get API key from environment
        api_key = get_groq_api_key()
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
                'model': 'llama3-8b-8192',
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
            # Try to surface Groq error body to client for debugging
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
                'model': 'llama3-8b-8192',
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
        
        if not email_account and not email_content:
            return jsonify({"error": "Email account or content is required"}), 400
        
        # Get API key from environment
        api_key = get_groq_api_key()
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
                'model': 'llama3-8b-8192',
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
                'model': 'llama3-8b-8192',
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

# API route for file analysis with AI
@app.route("/api/analyze-file", methods=["POST"])
@login_required
def analyze_file():
    """Analyze file using Groq AI API"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get file info
        file_name = file.filename
        _, ext = os.path.splitext(file_name)
        file_extension = (ext or '').lower()
        # Determine file size safely
        try:
            pos = file.stream.tell()
            file.stream.seek(0, os.SEEK_END)
            size_bytes = file.stream.tell()
            file.stream.seek(pos)
        except Exception:
            size_bytes = None
        file_size = f"{size_bytes} bytes" if size_bytes is not None else "unknown"
        
        # Get API key from environment
        api_key = get_groq_api_key()
        if not api_key:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Groq API key not configured. Please contact administrator.",
                "recommendations": ["Contact IT support to configure AI analysis"],
                "file_info": {"fileName": file_name, "extension": file_extension, "size": file_size}
            }), 500
        
        # Make request to Groq API
        response = requests.post('https://api.groq.com/openai/v1/chat/completions', 
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json={
                'model': 'llama3-8b-8192',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an AI file security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
                    },
                    {
                        'role': 'user',
                        'content': f'Analyze this file for security risks and potential malware:\nFile Name: {file_name}\nFile Extension: {file_extension}\nFile Size: {file_size}'
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
                "details": err_body,
                "file_info": {"fileName": file_name, "extension": file_extension, "size": file_size}
            }), 500
        
        result = response.json()
        ai_response = result.get('choices', [{}])[0].get('message', {}).get('content', '{}')
        
        try:
            parsed = json.loads(ai_response)
            return jsonify({
                "risk_score": parsed.get('risk_score', -1),
                "reasoning": parsed.get('reasoning', 'No reasoning provided'),
                "recommendations": parsed.get('recommendations', []),
                "file_info": {"fileName": file_name, "extension": file_extension, "size": file_size}
            })
        except json.JSONDecodeError:
            return jsonify({
                "risk_score": -1,
                "reasoning": "Invalid AI response format",
                "recommendations": ["Try keyword analysis instead"],
                "file_info": {"fileName": file_name, "extension": file_extension, "size": file_size}
            }), 500
            
    except Exception as e:
        return jsonify({
            "risk_score": -1,
            "reasoning": f"Error: {str(e)}",
            "recommendations": ["Try again later or use keyword analysis"],
            "file_info": {"fileName": "unknown", "extension": "unknown", "size": "unknown"}
        }), 500

# API route for phone analysis with AI
@app.route("/api/analyze-phone", methods=["POST"])
@login_required
def analyze_phone():
    """Analyze phone number using Groq AI API"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number', '').strip()
        
        if not phone_number:
            return jsonify({"error": "Phone number is required"}), 400
        
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
                'model': 'llama3-8b-8192',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an AI phone security analyzer. Return ONLY valid JSON in the following format:\n{\n  "risk_score": number between 0 and 10,\n  "reasoning": "short explanation of why",\n  "recommendations": ["step 1", "step 2"]\n}'
                    },
                    {
                        'role': 'user',
                        'content': f'Analyze this phone number for vishing and spoofing risks:\nPhone Number: {phone_number}'
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
                'model': 'llama3-8b-8192',
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

    ts = datetime.utcnow().strftime("%Y-%m-%dT%H-%M-%S")
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
        "maxRequestsWindow": MAX_REQUESTS_WINDOW,
    }

    with lock:
        blocked_view = {
            ip: {
                "penalty": info["penalty"],
                "remaining": max(0, int((info["until"] - datetime.utcnow()).total_seconds())),
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
        "respCounts": resp_counts
    })
    return jsonify(summary), 200


# Manual unblock endpoint for admins
@app.route("/unblock/<ip>", methods=["POST"])
def unblock(ip):
    # Check if user is authenticated admin
    if not session.get("admin"):
        return jsonify({"error": "Unauthorized"}), 401
    
    with lock:
        blocked.pop(ip, None)
        req_log.pop(ip, None)
        resp_log.pop(ip, None)
    return jsonify({"message": f"Unblocked {ip}"}), 200

# ----------------------------
# Run
# ----------------------------
if __name__ == "__main__":
    # host=0.0.0.0 lets other devices on your LAN reach it
    app.run(debug=True, host="0.0.0.0", port=2000, threaded=True)
