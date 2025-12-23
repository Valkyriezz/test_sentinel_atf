import sqlite3
import logging

logger = logging.getLogger(__name__)

def get_user_insecure(username):
    """
    VULNERABLE: This function is susceptible to SQL injection.
    An attacker could use: ' OR '1'='1
    """
    conn = sqlite3.connect('sql.db')
    cursor = conn.cursor()
    
    # VULNERABILITY: Directly injecting user input into the query string
    query = f"SELECT * FROM users WHERE username = '{username}'"
    
    logger.info(f"Executing query: {query}")
    
    try:
        cursor.execute(query)
        result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        logger.error(f"Database error: {e}")
        conn.close()
        return None
