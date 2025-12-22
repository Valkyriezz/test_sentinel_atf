"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, CheckCircle } from "lucide-react"

export default function TransferPage() {
  const router = useRouter()
  const [recipientEmail, setRecipientEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      // VULNERABILITY: No input validation or sanitization
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // VULNERABILITY: Insecure token transmission
          Authorization: token || "",
        },
        body: JSON.stringify({
          fromUserId: userId,
          toEmail: recipientEmail,
          amount: Number.parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setRecipientEmail("")
        setAmount("")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.message || "Transfer failed")
      }
    } catch (err) {
      setError("An error occurred during transfer")
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
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl">Transfer Money</CardTitle>
            <CardDescription>Send money to another SimpleBank user</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Transfer Successful!</h3>
                <p className="text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    placeholder="recipient@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Transfer"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
