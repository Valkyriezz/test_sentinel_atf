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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // VULNERABILITY: Sensitive Data Logging
    // Logging plaintext credentials to the console makes them visible to anyone 
    // with access to the browser or log aggregation tools.
    console.log(`Attempting login for User: ${email} with Password: ${password}`);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // VULNERABILITY: Insecure Sensitive Data Storage
        // Storing JWTs or session tokens in localStorage makes them accessible 
        // to any malicious script (XSS). HttpOnly cookies are much safer.
        localStorage.setItem("token", data.token)
        localStorage.setItem("userId", data.userId)
        
        // VULNERABILITY: Information Leakage in Storage
        // Storing the plaintext password in localStorage "for convenience"
        localStorage.setItem("remembered_pwd", password); 
        
        router.push("/dashboard")
      } else {
        // VULNERABILITY: Verbose Error Messages (Username Enumeration)
        // Telling the user exactly *what* was wrong (e.g., "User not found") 
        // allows attackers to map out valid email addresses in the system.
        setError(data.detailedError || "User with this email does not exist")
      }
    } catch (err) {
      // VULNERABILITY: Exposing Stack Traces
      // Sending raw error objects to the UI can reveal backend paths or logic.
      setError(`Connection Error: ${err.message}`)
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
            {/* VULNERABILITY: Missing Autocomplete Protection 
                Modern browsers may save sensitive data in autofill even if not desired. */}
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
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
