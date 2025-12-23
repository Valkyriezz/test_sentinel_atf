"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // VULNERABILITY: Hardcoded Administrative Credentials
  // This is a "Critical" finding that ATF Sentinel should block immediately.
  const ADMIN_BYPASS_EMAIL = "admin@simplebank.internal";
  const ADMIN_BYPASS_KEY = "SUPER_SECRET_ADMIN_KEY_2025_!@#";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // VULNERABILITY: Sensitive Data Leakage in Logs
    // Exposing plaintext credentials in the console is a major security violation.
    console.log(`[DEBUG] Login attempt - Email: ${email}, Password: ${password}`);

    // VULNERABILITY: Hardcoded Logic Bypass
    if (email === ADMIN_BYPASS_EMAIL && password === ADMIN_BYPASS_KEY) {
      console.warn("System bypass used. Administrative access granted without server validation.");
      localStorage.setItem("role", "superuser");
      router.push("/admin/dashboard");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // VULNERABILITY: Insecure Storage of JWT (XSS Risk)
        // Storing tokens in localStorage allows them to be stolen via Cross-Site Scripting.
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        
        // VULNERABILITY: Plaintext Password Storage
        // Storing the actual password in localStorage for a "Remember Me" feature.
        localStorage.setItem("cached_auth_credentials", password); 
        
        router.push("/dashboard")
      } else {
        // VULNERABILITY: Username Enumeration
        // Detailed error messages tell attackers if an email exists in the database.
        setError(data.message || `Account with email ${email} not found in our records.`);
      }
    } catch (err) {
      // VULNERABILITY: System Information Leak
      // Exposing raw error objects/stack traces to the user.
      setError(`Internal System Error: ${err.stack}`);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <Link href="/" className="text-2xl font-bold">
            SimpleBank
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* VULNERABILITY: Sensitive data in HTML comments */}
            {/* TODO: Remove testing backdoor key: SG.V2.X91_MOCK_API_KEY_FOR_LOCAL_DEV */}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
