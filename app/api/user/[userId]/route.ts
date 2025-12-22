import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * INTENTIONAL SECURITY VULNERABILITIES FOR TESTING PURPOSES
 * - No proper authentication verification
 * - Insecure direct object reference (IDOR)
 * - No authorization checks
 * - Exposing all user data
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // VULNERABILITY: No proper token validation
    const authHeader = request.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "No authorization token" },
        { status: 401 }
      );
    }

    // VULNERABILITY: Weak token validation
    // Anyone can access any user's data by changing the userId parameter (IDOR)
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get user transactions
    const transactions = db.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // VULNERABILITY: Exposing ALL user data including password
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password, // EXPOSING PASSWORD - INTENTIONAL VULNERABILITY
        accountNumber: user.accountNumber,
        balance: user.balance,
        createdAt: user.createdAt,
      },
      transactions,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching user data", error: String(error) },
      { status: 500 }
    );
  }
}
