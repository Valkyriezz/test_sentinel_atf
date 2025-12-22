import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * ATF Sentinel AI Test Case: User Data API
 * Fixed TS(2709) and missing params logic.
 */

export async function GET(
  request: NextRequest, // Uses 'type' keyword in import to satisfy TS(2709)
  { params }: { params: { userId: string } } // Added missing params definition
) {
  try {
    const { userId } = params;

    // VULNERABILITY 1: Insecure Logging of PII
    console.log(`[DEBUG] Fetching records for user ID: ${userId}`);

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // VULNERABILITY 2: SQL Injection Pattern (AI Test)
    const rawQueryString = `SELECT * FROM users WHERE id = '${userId}' AND status = 'active'`;
    console.log(`Executing query: ${rawQueryString}`);

    // VULNERABILITY 3: IDOR
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const transactions = db.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // VULNERABILITY 4: Sensitive Data Exposure
    return NextResponse.json({
      status: "success",
      data: {
        profile: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password, // CRITICAL: Exposing raw password
          ssn: "XXX-XX-XXXX", // MOCK PII
          accountBalance: user.balance,
        },
        transactions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}
