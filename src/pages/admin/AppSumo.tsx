"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function AppSumo() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [redemptions, setRedemptions] = useState([])
  const searchParams = useSearchParams()

  // Auto-redeem if ?code=XYZ is present in the URL
  useEffect(() => {
    const urlCode = searchParams.get("code")
    if (urlCode) {
      setCode(urlCode)
      handleRedeem(urlCode)
    }
  }, [searchParams])

  // Fetch redemption history
  useEffect(() => {
    if (!userId) return

    const fetchRedemptions = async () => {
      try {
        const res = await fetch(`/api/appsumo/redemptions?user_id=${userId}`)
        const data = await res.json()
        setRedemptions(data)
      } catch (err) {
        console.error("Failed to fetch redemptions", err)
      }
    }

    fetchRedemptions()
  }, [userId])

  const handleRedeem = async (manualCode?: string) => {
    const redeemCode = manualCode || code
    if (!redeemCode) return

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/appsumo/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: redeemCode,
          user_id: userId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setRedemptions((prev) => [...prev, data])
      } else {
        setError(data?.error || "Failed to redeem code.")
      }
    } catch (err) {
      console.error(err)
      setError("Something went wrong.")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Redeem Your AppSumo Code</h1>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Enter your code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
        />
        <Button onClick={() => handleRedeem()} disabled={loading || !code}>
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Redeem"}
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="mr-2" /> Code redeemed successfully!
        </div>
      )}

      {redemptions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Your Redemptions</h2>
          <div className="space-y-4">
            {redemptions.map((item: any, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <p className="font-medium">Code: {item.code}</p>
                  <p className="text-sm text-muted-foreground">
                    Plan: {item.plan || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redeemed: {new Date(item.redeemed_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
