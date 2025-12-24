from flask import Flask, request, render_template_string
import sqlite3
import subprocess
import os
import logging

app = Flask(__name__)

# =============================================================================
# VULNERABILITY: HARDCODED PRODUCTION SECRETS
# =============================================================================
DEMO_SECRET_KEY = "sk_live_demo_51PzX91SentinelTestingOnly"
DATABASE_CREDS = "root:admin_password_bypass_992!@#"

# Logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DemoService")

def get_db_connection():
    conn = sqlite3.connect('sql.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return """
    <h1>🛡️ ATF Sentinel Live Demo</h1>
    <p>Test the following vulnerable endpoints:</p>
    <ul>
        <li><b>SQLi:</b> <code>/user?name=admin' OR '1'='1</code></li>
        <li><b>XSS:</b> <code>/greet?name=&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
        <li><b>CMD Injection:</b> <code>/ping?host=8.8.8.8;cat /etc/passwd</code></li>
    </ul>
    """

# =========================================================================
# VULNERABILITY: SQL INJECTION (SQLi)
# =========================================================================
@app.route('/user')
def get_user():
    """
    VULNERABLE: Uses f-string formatting to build SQL.
    """
    user_name = request.args.get('name', '')
    conn = get_db_connection()
    
    # Sentinel Pattern: f-string interpolation in execute()
    query = f"SELECT * FROM users WHERE username = '{user_name}'"
    logger.info(f"🔍 Executing Query: {query}")
    
    try:
        user = conn.execute(query).fetchone()
        conn.close()
        if user:
            return dict(user)
        return "User not found", 404
    except Exception as e:
        return str(e), 500

# =========================================================================
# VULNERABILITY: REFLECTED CROSS-SITE SCRIPTING (XSS)
# =========================================================================
@app.route('/greet')
def greet():
    """
    VULNERABLE: Directly renders user input in HTML without escaping.
    """
    name = request.args.get('name', 'Guest')
    
    # Sentinel Pattern: render_template_string with unescaped input
    html_template = f"<div><h1>Hello, {name}!</h1></div>"
    
    logger.info(f"📝 Rendering XSS template for: {name}")
    return render_template_string(html_template)

# =========================================================================
# VULNERABILITY: COMMAND INJECTION
# =========================================================================
@app.route('/ping')
def network_test():
    """
    VULNERABLE: Passes unsanitized input to subprocess with shell=True.
    """
    target = request.args.get('host', '127.0.0.1')
    
    # Sentinel Pattern: subprocess + shell=True + f-string
    command = f"ping -c 1 {target}"
    
    logger.warning(f"⚡ Running system command: {command}")
    
    try:
        # High-risk function call
        output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT)
        return f"<pre>{output.decode()}</pre>"
    except subprocess.CalledProcessError as e:
        return f"Error: {e.output.decode()}", 500

# =========================================================================
# VULNERABILITY: INSECURE FILE PERMISSIONS & HARDCODED PATHS
# =========================================================================
@app.route('/debug/export')
def export_debug_info():
    """
    VULNERABLE: Writes sensitive info to a world-readable file.
    """
    debug_file = "/tmp/debug_dump.txt"
    with open(debug_file, "w") as f:
        # Leaking hardcoded credentials into a file
        f.write(f"DB_CREDS={DATABASE_CREDS}\n")
        f.write(f"SECRET={DEMO_SECRET_KEY}\n")
    
    # Sentinel Pattern: os.chmod 777
    os.chmod(debug_file, 0o777)
    return f"Debug info exported to {debug_file}"

if __name__ == '__main__':
    # VULNERABILITY: Running with debug=True in an app exposed externally
    app.run(host='0.0.0.0', port=5000, debug=True)
