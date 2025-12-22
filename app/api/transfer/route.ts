import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

/**
 * INTENTIONAL SECURITY VULNERABILITIES FOR TESTING PURPOSES
 * - No CSRF protection
 * - No input validation
 * - Race condition vulnerability
 * - No rate limiting
 * - Insecure authorization
 */

export async function POST(request: NextRequest) {
  try {
    const { fromUserId, toEmail, amount } = await request.json()

    // VULNERABILITY: No proper authentication verification
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // VULNERABILITY: No input validation
    if (!fromUserId || !toEmail || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // VULNERABILITY: No validation that amount is positive
    // VULNERABILITY: No authorization check (can transfer from any account)
    const fromUser = db.users.find((u) => u.id === fromUserId)
    const toUser = db.users.find((u) => u.email === toEmail)

    if (!fromUser) {
      return NextResponse.json({ message: "Sender not found" }, { status: 404 })
    }

    if (!toUser) {
      return NextResponse.json({ message: "Recipient not found" }, { status: 404 })
    }

    // VULNERABILITY: Race condition - no transaction locking
    if (fromUser.balance < amount) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 })
    }

    // Perform transfer
    fromUser.balance -= amount
    toUser.balance += amount

    // Record transactions
    const transactionId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    db.transactions.push({
      id: `${transactionId}-debit`,
      userId: fromUser.id,
      type: "debit",
      amount,
      from: fromUser.email,
      to: toUser.email,
      date: timestamp,
    })

    db.transactions.push({
      id: `${transactionId}-credit`,
      userId: toUser.id,
      type: "credit",
      amount,
      from: fromUser.email,
      to: toUser.email,
      date: timestamp,
    })

    // VULNERABILITY: Exposing sensitive data in response
    return NextResponse.json({
      message: "Transfer successful",
      transaction: {
        id: transactionId,
        from: fromUser.email,
        to: toUser.email,
        amount,
        fromBalance: fromUser.balance,
        toBalance: toUser.balance,
        timestamp,
      },
    })
  } catch (error) {
    // VULNERABILITY: Detailed error exposure
    return NextResponse.json({ message: "Transfer failed", error: String(error) }, { status: 500 })
  }
}
