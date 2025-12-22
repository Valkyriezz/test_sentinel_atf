"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, DollarSign, ArrowUpRight, LogOut } from "lucide-react"

interface Transaction {
  id: string
  type: "credit" | "debit"
  amount: number
  from?: string
  to?: string
  date: string
}

interface UserData {
  name: string
  email: string
  balance: number
  accountNumber: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // VULNERABILITY: Token retrieved from insecure localStorage
      const token = localStorage.getItem("token")
      const userId = localStorage.getItem("userId")

      if (!token || !userId) {
        router.push("/login")
        return
      }

      // VULNERABILITY: No CSRF protection
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          // VULNERABILITY: Token sent in custom header without proper validation
          Authorization: token,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setUserData(data.user)
        setTransactions(data.transactions)
      } else {
        router.push("/login")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">SimpleBank</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {userData?.name}</h2>
          <p className="text-muted-foreground">Account: {userData?.accountNumber}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className="text-4xl">${userData?.balance.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/transfer">
                <Button className="w-full">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Transfer Money
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Account Information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{userData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{userData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="font-medium">{userData?.accountNumber}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        <DollarSign
                          className={`h-5 w-5 ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === "credit" ? "Received from" : "Sent to"}{" "}
                          {transaction.type === "credit" ? transaction.from : transaction.to}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        transaction.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
