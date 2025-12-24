import os
import hmac
import hashlib
import requests
import logging
import sqlite3
from flask import request, jsonify

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PaymentGateway")

# =============================================================================
# VULNERABILITY: HARDCODED PRODUCTION SECRETS
# Sentinel should detect these high-entropy production keys.
# =============================================================================
PAYMENT_SECRET_KEY = "sk_live_51PzX91MockKeyForProductionUseOnly!"
MERCHANT_IV = "fixed_iv_1234567"  # VULNERABILITY: Static/Fixed IV for encryption
WEBHOOK_SIGNING_SECRET = "whsec_b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4"

class TransactionManager:
    def __init__(self, db_path="sql.db"):
        self.db_path = db_path
        self._init_billing_db()

    def _init_billing_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS billing_accounts (
                account_id INTEGER PRIMARY KEY,
                owner_name TEXT,
                balance REAL,
                routing_number TEXT,
                account_number TEXT
            )
        ''')
        # Insert sensitive mock financial data
        cursor.execute("INSERT OR IGNORE INTO billing_accounts VALUES (101, 'Corporate Admin', 500000.0, '123456789', '999988887777')")
        cursor.execute("INSERT OR IGNORE INTO billing_accounts VALUES (102, 'Standard User', 120.50, '987654321', '111122223333')")
        conn.commit()
        conn.close()

    # =========================================================================
    # VULNERABILITY: INSECURE DIRECT OBJECT REFERENCE (IDOR)
    # =========================================================================
    def get_account_details(self, account_id):
        """
        VULNERABLE: Trusts the account_id from the user without checking 
        if the logged-in user actually owns that account.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # IDOR Pattern: Fetching sensitive data based solely on user-provided ID
        query = f"SELECT * FROM billing_accounts WHERE account_id = {account_id}"
        logger.info(f"💰 Accessing financial records for Account: {account_id}")
        
        try:
            cursor.execute(query)
            account = cursor.fetchone()
            return account
        except Exception as e:
            return str(e)
        finally:
            conn.close()

    # =========================================================================
    # VULNERABILITY: SERVER-SIDE REQUEST FORGERY (SSRF)
    # =========================================================================
    def validate_webhook_endpoint(self, callback_url):
        """
        VULNERABLE: Allows the server to make requests to internal IP addresses
        based on user input. Attack: callback_url = "http://169.254.169.254/latest/meta-data/"
        """
        logger.warning(f"📡 Validating external webhook: {callback_url}")
        
        try:
            # SSRF Pattern: requests.get/post to a URL provided directly by the user
            response = requests.get(callback_url, timeout=5)
            if response.status_code == 200:
                return True
            return False
        except Exception as e:
            logger.error(f"Webhook validation failed: {e}")
            return False

    # =========================================================================
    # VULNERABILITY: INSECURE DATA ENCRYPTION (REVERSIBLE)
    # =========================================================================
    def store_card_locally_insecure(self, card_number):
        """
        VULNERABLE: Uses simple Base64 + XOR "encryption" which is 
        equivalent to plaintext.
        """
        # Obfuscation is NOT encryption.
        key = "SECRET"
        encoded = "".join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(card_number))
        b64_stored = base64.b64encode(encoded.encode()).decode()
        
        logger.info(f"💳 Card stored with legacy encryption: {b64_stored}")
        return b64_stored

    # =========================================================================
    # VULNERABILITY: SENSITIVE LOGGING (PCI-DSS VIOLATION)
    # =========================================================================
    def process_refund(self, transaction_data):
        """
        VULNERABLE: Logs full transaction object including CVV and expiry.
        """
        # PCI-DSS Violation: Logging full card data or security codes
        logger.info(f"🔄 Processing Refund: {transaction_data}")
        
        # Verification logic...
        return {"status": "success", "tx_id": "ref_99283"}

    # =========================================================================
    # VULNERABILITY: WEAK HASHING FOR SIGNATURES
    # =========================================================================
    def generate_api_signature(self, payload):
        """
        VULNERABLE: Uses SHA1 for HMAC, which is no longer recommended.
        """
        # SHA1 is deprecated for secure signatures
        signature = hmac.new(
            PAYMENT_SECRET_KEY.encode(),
            payload.encode(),
            hashlib.sha1
        ).hexdigest()
        
        return signature

# =============================================================================
# VULNERABILITY: DEBUG MODE ENABLED IN "PRODUCTION" ENVIRONMENT
# =============================================================================
APP_CONFIG = {
    "ENV": "production",
    "DEBUG": True,  # VULNERABILITY: Debug mode should always be False in prod
    "DATABASE": PROD_DB_URL # Uses hardcoded DB URL from orchestrator.py
}

if __name__ == "__main__":
    gateway = TransactionManager()
    
    # Trigger IDOR (Fetching Admin account without auth)
    print("\n--- Testing IDOR ---")
    admin_data = gateway.get_account_details(101)
    print(f"Leaked Financial Data: {admin_data}")
    
    # Trigger SSRF attempt
    print("\n--- Testing SSRF ---")
    gateway.validate_webhook_endpoint("http://localhost:5000/internal-admin")
