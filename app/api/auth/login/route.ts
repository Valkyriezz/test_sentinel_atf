import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * INTENTIONAL SECURITY VULNERABILITIES FOR TESTING PURPOSES
 * - No password hashing verification
 * - No rate limiting
 * - Insecure authentication logic
 * - Detailed error messages
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // VULNERABILITY: No input validation or sanitization
    // VULNERABILITY: SQL injection vulnerability
    const user = db.users.find((u) => u.email === email)

    if (!user) {
      // VULNERABILITY: Detailed error message helps attackers enumerate users
      return NextResponse.json({ message: "User not found with this email" }, { status: 401 })
    }

    // VULNERABILITY: Plaintext password comparison
    if (user.password !== password) {
      // VULNERABILITY: Detailed error message
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 })
    }

    // VULNERABILITY: Insecure token generation
    const token = Buffer.from(`${user.id}:${email}:${Date.now()}`).toString("base64")

    // VULNERABILITY: Exposing sensitive user data
    return NextResponse.json({
      message: "Login successful",
      token,
      userId: user.id,
      user: {
        name: user.name,
        email: user.email,
        password: user.password, // EXPOSING PASSWORD - INTENTIONAL VULNERABILITY
        accountNumber: user.accountNumber,
        balance: user.balance,
      },
    })
  } catch (error) {
    // VULNERABILITY: Detailed error information exposed
    return NextResponse.json({ message: "Login error", error: String(error) }, { status: 500 })
  }
}
