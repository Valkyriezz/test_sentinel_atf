/**
 * INTENTIONAL SECURITY VULNERABILITIES FOR TESTING PURPOSES
 *
 * This is an in-memory mock database with hardcoded secrets and test data.
 * DO NOT USE IN PRODUCTION.
 */

// VULNERABILITY: Hardcoded database credentials
const DB_CONFIG = {
  // These would typically be in environment variables, but hardcoded for testing
  MONGO_URI: "mongodb://admin:SuperSecret123@localhost:27017/simplebank",
  MONGO_USER: "admin",
  MONGO_PASSWORD: "SuperSecret123",
  DB_NAME: "simplebank",
}

// VULNERABILITY: Hardcoded JWT secret
export const JWT_SECRET = "myVeryInsecureJWTSecret123!@#"

// VULNERABILITY: Hardcoded API keys
export const API_KEYS = {
  STRIPE_SECRET: "sk_test_51HardcodedStripeKey123456789",
  AWS_SECRET_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  SENDGRID_API_KEY: "SG.HardcodedSendGridKey123456789",
}

interface User {
  id: string
  name: string
  email: string
  password: string // STORED IN PLAINTEXT - VULNERABILITY
  accountNumber: string
  balance: number
  createdAt: string
}

interface Transaction {
  id: string
  userId: string
  type: "credit" | "debit"
  amount: number
  from: string
  to: string
  date: string
}

// In-memory database
export const db: {
  users: User[]
  transactions: Transaction[]
} = {
  users: [
    // VULNERABILITY: Pre-populated test users with plaintext passwords
    {
      id: "user-001",
      name: "John Doe",
      email: "john@example.com",
      password: "password123", // PLAINTEXT PASSWORD
      accountNumber: "ACC1001",
      balance: 5000.0,
      createdAt: new Date().toISOString(),
    },
    {
      id: "user-002",
      name: "Jane Smith",
      email: "jane@example.com",
      password: "admin123", // PLAINTEXT PASSWORD
      accountNumber: "ACC1002",
      balance: 3500.0,
      createdAt: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      id: "txn-001",
      userId: "user-001",
      type: "credit",
      amount: 5000.0,
      from: "SimpleBank",
      to: "john@example.com",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "txn-002",
      userId: "user-002",
      type: "credit",
      amount: 3500.0,
      from: "SimpleBank",
      to: "jane@example.com",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

// VULNERABILITY: Exposed admin credentials
export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  email: "admin@simplebank.com",
}

// VULNERABILITY: Debug mode enabled with sensitive logging
export const DEBUG_MODE = true

export function logSensitiveData(action: string, data: any) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${action}:`, JSON.stringify(data, null, 2))
  }
}
