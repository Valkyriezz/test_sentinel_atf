import sqlite3
import hashlib
import logging
import os
import base64
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LegacyService")

# =============================================================================
# VULNERABILITY: HARDCODED SENSITIVE KEYS
# ATF Sentinel should flag these as HIGH or CRITICAL.
# =============================================================================
SERVICE_API_KEY = "SG.V2.X91_MOCK_API_KEY_FOR_LOCAL_DEV" # Hardcoded SendGrid-style key
STRIPE_TEST_SECRET = "sk_test_4eC39HqLyjWDarjtT1zdp7dc" # Hardcoded Stripe key
AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"                # Hardcoded AWS Key
INTERNAL_PASSPHRASE = "atf_sentinel_master_bypass_2025" # Plaintext passphrase

class LegacyUserManager:
    def __init__(self, db_path="sql.db"):
        self.db_path = db_path
        self._initialize_db()

    def _initialize_db(self):
        """Initializes the database with sensitive user info."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                fullname TEXT,
                phone_number TEXT,
                email TEXT,
                credit_card TEXT,
                password_hash TEXT,
                is_admin INTEGER
            )
        ''')
        # Insert some dummy sensitive data for testing
        cursor.execute("INSERT OR IGNORE INTO users VALUES (1, 'Admin User', '+91-98765-43210', 'admin@aitf.jp', '4111-2222-3333-4444', 'admin123', 1)")
        cursor.execute("INSERT OR IGNORE INTO users VALUES (2, 'Internal Dev', '080-1234-5678', 'dev@aitf.jp', '5555-4444-3333-2222', 'password', 0)")
        conn.commit()
        conn.close()

    # =========================================================================
    # VULNERABILITY: SQL INJECTION (Phone Number Query)
    # =========================================================================
    def find_user_by_phone_insecure(self, phone_input):
        """
        VULNERABLE: Uses string formatting for SQL query.
        Attack: '+91-000' OR '1'='1'
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # String concatenation in SQL is the primary indicator of SQLi
        query = "SELECT * FROM users WHERE phone_number = '" + phone_input + "'"
        
        print(f"[DEBUG] Running query: {query}")
        try:
            cursor.execute(query)
            return cursor.fetchall()
        except Exception as e:
            return str(e)
        finally:
            conn.close()

    # =========================================================================
    # VULNERABILITY: INFORMATION LEAKAGE & SENSITIVE DATA EXPOSURE
    # =========================================================================
    def log_user_details(self, user_id):
        """
        VULNERABLE: Logs PII (Phone numbers and Credit Cards) to system logs.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT fullname, phone_number, credit_card FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if user:
            # PII should never be logged in plaintext
            logger.info(f"User Access Trace: Name={user[0]}, Phone={user[1]}, CC={user[2]}")
        conn.close()

    # =========================================================================
    # VULNERABILITY: WEAK CRYPTOGRAPHY (MD5)
    # =========================================================================
    def check_password_weak(self, username, password_input):
        """
        VULNERABLE: Uses MD5 which is cryptographically broken.
        """
        # MD5 is no longer secure for password hashing
        hasher = hashlib.md5()
        hasher.update(password_input.encode('utf-8'))
        hashed_attempt = hasher.hexdigest()
        
        logger.info(f"Checking hash {hashed_attempt} for user {username}")
        # In reality, you'd compare this to the DB
        return True

    # =========================================================================
    # VULNERABILITY: INSECURE DESERIALIZATION / HARDCODED BYPASS
    # =========================================================================
    def process_internal_token(self, token_b64):
        """
        VULNERABLE: Decodes a token and trusts the 'admin' flag without verification.
        """
        try:
            decoded_bytes = base64.b64decode(token_b64)
            token_str = decoded_bytes.decode('utf-8')
            
            # Dangerous: trusting client-side flags
            if "admin=true" in token_str:
                logger.warning("Administrative access granted via token bypass!")
                return True
            return False
        except:
            return False

# =============================================================================
# MOCK EXECUTION BLOCK
# =============================================================================
if __name__ == "__main__":
    manager = LegacyUserManager()
    
    # Test SQL Injection via Phone
    print("\n--- Testing SQL Injection ---")
    malicious_phone = "'+91-000' OR '1'='1"
    results = manager.find_user_by_phone_insecure(malicious_phone)
    print(f"Injection Result: {results}")

    # Test PII Logging
    print("\n--- Testing PII Logging ---")
    manager.log_user_details(1)

    # Hardcoded Key usage display
    print(f"\n[SYSTEM] Initializing AWS Service with Key: {AWS_ACCESS_KEY}")
