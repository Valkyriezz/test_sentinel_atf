/**
 * ATF Sentinel Security Playground - Test Configuration
 * * This file is INTENTIONALLY VULNERABLE to test:
 * 1. Regex Pattern Detection (Secrets & PII)
 * 2. AI Logic Analysis (Gemini)
 * 3. SendGrid Email Blocking Alerts
 */

export const APP_CONFIG = {
  // ---------------------------------------------------------
  // 1. HARDCODED SECRETS (Triggers: Regex BLOCK & SendGrid Email)
  // ---------------------------------------------------------

  // Database URI with embedded credentials
  DATABASE_URL:
    "postgresql://sentinel_admin:P@ssword123!@localhost:5432/bank_db",

  // AWS Cloud Storage Keys
  AWS_ACCESS_KEY_ID: "AKIAIMNO789654321EXAMPLE",
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",

  // Payment Provider & Communication
  STRIPE_SECRET_KEY: "sk_test_4eC39HqLyjWDarjtT1zdp7dc",
  SENDGRID_API_KEY: "SG.HardcodedKey_For_Testing_Alerts_12345",

  // GitHub Integration
  GITHUB_PERSONAL_TOKEN: "ghp_secureTokenTest1234567890123456789012",

  // ---------------------------------------------------------
  // 2. PERSONALLY IDENTIFIABLE INFORMATION (Triggers: PII Scan)
  // ---------------------------------------------------------

  // Customer Support Contact (Leaks PII in source)
  SUPPORT_EMAIL: "vanshikhastri@gmail.com",
  SUPPORT_PHONE: "090-1234-5678", // Japanese Phone Pattern
  DEBUG_IP_WHITELIST: ["192.168.1.1", "127.0.0.1"],

  // ---------------------------------------------------------
  // 3. LOGICAL VULNERABILITIES (Triggers: AI Gemini Analysis)
  // ---------------------------------------------------------

  // Security Headers & Policy
  SECURITY: {
    ENABLE_CORS_ALL: true, // Vulnerability: Allows '*' origin
    SKIP_CSRF_VALIDATION: true, // Vulnerability: CSRF protection disabled
    ALLOW_INSECURE_COOKIES: true, // Vulnerability: cookie.secure = false
    JWT_SECRET: "weak_dev_secret", // Vulnerability: Low entropy key
  },

  // Feature Flags
  DEBUG_MODE: true, // Vulnerability: Information disclosure
  INTERNAL_LOGGING: {
    LOG_RAW_REQUESTS: true, // Vulnerability: Logs sensitive payloads
    LOG_DATABASE_QUERIES: true, // Vulnerability: Potential SQL exposure
  },
};

/**
 * LOGIC TEST CASE:
 * Gemini should flag the following as a Broken Access Control risk.
 */
export const PERMISSION_LOGIC = {
  checkAccess: (userRole: string) => {
    // VULNERABILITY: Fail-open logic if role is undefined
    if (userRole !== "guest") {
      return true;
    }
    return false;
  },
};
