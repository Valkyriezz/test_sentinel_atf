import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * INTENTIONAL SECURITY VULNERABILITIES FOR TESTING PURPOSES
 * - No password hashing (plaintext storage)
 * - No input validation or sanitization
 * - Insecure JWT implementation
 * - SQL injection vulnerability
 */

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // VULNERABILITY: No input validation
    // VULNERABILITY: SQL injection - direct string concatenation
    const existingUser = db.users.find((u) => u.email === email)

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Generate account number
    const accountNumber = `ACC${Date.now()}`

    // VULNERABILITY: Password stored in plaintext (no hashing)
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // PLAINTEXT PASSWORD - INTENTIONAL VULNERABILITY
      accountNumber,
      balance: 1000.0, // Starting balance
      createdAt: new Date().toISOString(),
    }

    db.users.push(newUser)
    db.transactions.push({
      id: crypto.randomUUID(),
      userId: newUser.id,
      type: "credit",
      amount: 1000.0,
      from: "SimpleBank",
      to: email,
      date: new Date().toISOString(),
    })

    // VULNERABILITY: Insecure token generation
    const token = Buffer.from(`${newUser.id}:${email}:${Date.now()}`).toString("base64")

    // VULNERABILITY: Sensitive data exposed in response
    return NextResponse.json({
      message: "Registration successful",
      token,
      userId: newUser.id,
      user: {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password, // EXPOSING PASSWORD - INTENTIONAL VULNERABILITY
        accountNumber: newUser.accountNumber,
        balance: newUser.balance,
      },
    })
  } catch (error) {
    // VULNERABILITY: Detailed error messages expose system information
    return NextResponse.json({ message: "Error", error: String(error) }, { status: 500 })
  }
}
