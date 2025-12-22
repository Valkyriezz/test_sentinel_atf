/**
 * INTENTIONAL SECURITY VULNERABILITIES FOR TESTING PURPOSES
 *
 * Configuration file with hardcoded secrets and insecure settings
 */

// VULNERABILITY: Hardcoded secrets in configuration file
export const APP_CONFIG = {
  // Database
  DATABASE_URL: "mongodb://admin:SuperSecret123@localhost:27017/simplebank",
  DATABASE_USER: "admin",
  DATABASE_PASSWORD: "SuperSecret123",

  // JWT
  JWT_SECRET: "myVeryInsecureJWTSecret123!@#",
  JWT_EXPIRY: "24h",

  // API Keys
  STRIPE_SECRET_KEY: "sk_test_51HardcodedStripeKey123456789",
  STRIPE_PUBLIC_KEY: "pk_test_51HardcodedStripePublicKey123456789",

  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  AWS_REGION: "us-east-1",

  SENDGRID_API_KEY: "SG.HardcodedSendGridKey123456789",

  // OAuth
  GOOGLE_CLIENT_ID: "123456789-hardcodedgoogleclientid.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: "GOCSPX-hardcoded_google_secret",

  // Encryption
  ENCRYPTION_KEY: "hardcoded-encryption-key-32-chars",

  // Admin
  ADMIN_EMAIL: "admin@simplebank.com",
  ADMIN_PASSWORD: "Admin@123",

  // Feature Flags
  ENABLE_DEBUGGING: true,
  LOG_SENSITIVE_DATA: true,
  SKIP_AUTH_CHECKS: false,
}

// VULNERABILITY: Insecure CORS configuration
export const CORS_CONFIG = {
  origin: "*", // Allows all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["*"],
}

// VULNERABILITY: No rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  enabled: false, // Rate limiting disabled
  maxRequests: 1000000,
  windowMs: 60000,
}

// VULNERABILITY: Weak password requirements
export const PASSWORD_POLICY = {
  minLength: 6,
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
  requireSpecialChars: false,
}

// VULNERABILITY: Session configuration
export const SESSION_CONFIG = {
  secret: "hardcoded-session-secret-key",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Not requiring HTTPS
    httpOnly: false, // Accessible via JavaScript
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
}
