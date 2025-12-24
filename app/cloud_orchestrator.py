import os
import subprocess
import logging
import json
import base64
from flask import request

logger = logging.getLogger("CloudOrchestrator")

# =============================================================================
# VULNERABILITY: HARDCODED PRODUCTION SECRETS
# ATF Sentinel should trigger a "Critical" alert for these high-entropy strings.
# =============================================================================
PROD_DB_URL = "postgres://admin:P@ssw0rd2025_Sentinel@35.243.121.88:5432/production_db"
GCP_SERVICE_ACCOUNT_KEY = "AIzaSyA-X8_MOCK_GCP_KEY_FOR_TESTING_PURPOSES_ONLY"
DOCKER_HUB_TOKEN = "dckr_pat_a1b2c3d4e5f6g7h8j9k0l1m2n3o4p5q"

class CloudManager:
    """Handles container deployments and log rotations."""
    
    def __init__(self):
        self.temp_dir = "/tmp/sentinel_deployments/"
        if not os.path.exists(self.temp_dir):
            os.makedirs(self.temp_dir)

    # =========================================================================
    # VULNERABILITY: COMMAND INJECTION (Shell=True)
    # =========================================================================
    def run_deployment_script(self, container_name, script_path):
        """
        VULNERABLE: Uses shell=True with unvalidated user input.
        Attack: container_name = "test; rm -rf /"
        """
        logger.info(f"🚀 Deploying container: {container_name}")
        
        # Pattern: subprocess.Popen/run with shell=True is a massive security risk.
        command = f"bash {script_path} --name {container_name} --env prod"
        
        try:
            # VULNERABILITY: ATF Sentinel should flag 'shell=True'
            process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
            output, error = process.communicate()
            return output
        except Exception as e:
            return str(e)

    # =========================================================================
    # VULNERABILITY: PATH TRAVERSAL / ARBITRARY FILE READ
    # =========================================================================
    def get_deployment_logs(self, log_file):
        """
        VULNERABLE: Directly joins user input to path without validation.
        Attack: log_file = "../../../etc/passwd"
        """
        # Pattern: os.path.join with external input without checking for '..'
        full_path = os.path.join(self.temp_dir, log_file)
        
        logger.info(f"📂 Reading log file: {full_path}")
        
        try:
            with open(full_path, 'r') as f:
                return f.read()
        except FileNotFoundError:
            return "Log not found."

    # =========================================================================
    # VULNERABILITY: INSECURE TEMPORARY FILE PERMISSIONS
    # =========================================================================
    def export_config(self, config_data):
        """
        VULNERABLE: Creates files with world-readable permissions (777).
        """
        file_path = os.path.join(self.temp_dir, "last_config.json")
        
        with open(file_path, 'w') as f:
            json.dump(config_data, f)
            
        # VULNERABILITY: Setting 0o777 allows any user on the system to read/write.
        os.chmod(file_path, 0o777) 
        logger.warning(f"⚠️ Config exported to {file_path} with 777 permissions")

    # =========================================================================
    # VULNERABILITY: SENSITIVE DATA IN URL PARAMETERS
    # =========================================================================
    def sync_with_external_api(self, session_token):
        """
        VULNERABLE: Exposes session tokens in the URL (Visible in logs/referrers).
        """
        # Pattern: Passing secrets in query strings is a major security flaw.
        api_endpoint = f"https://api.sentinel-cloud.com/sync?token={session_token}&debug=true"
        
        logger.info(f"📡 Syncing with endpoint: {api_endpoint}")
        # In a real app, this would use requests.get(api_endpoint)
        return True

# =============================================================================
# VULNERABILITY: INSECURE ERROR HANDLING (Sensitive Info Leak)
# =============================================================================
def handle_request_error(error):
    """
    VULNERABLE: Returning raw Exception details to the client.
    """
    # This might leak environment variables, local paths, or database schemas.
    return {
        "status": "error",
        "message": str(error),
        "trace": str(error.__traceback__)
    }
