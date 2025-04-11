"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, you would make an API call to send a password reset email
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // })
      
      // if (!response.ok) {
      //   throw new Error('Failed to send reset email')
      // }

      // Success case - simulate successful email sending
      toast({
        title: "Reset email sent",
        description: "If an account exists with that email, you will receive a password reset link.",
      })

      // Redirect to sign in page after a delay
      setTimeout(() => {
        router.push("/auth/sign-in")
      }, 2000)
    } catch (error) {
      console.error("Forgot password error:", error)
      toast({
        title: "Something went wrong",
        description: "Failed to send reset email. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending reset link
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
