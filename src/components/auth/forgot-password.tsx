"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { serviceProvider } from "@/services/serviceProvider"

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const authService = serviceProvider.getAuthService()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authService.forgotPassword(email)
      toast({
        title: "Reset email sent",
        description: "Please check your email for password reset instructions.",
      })
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)
    } catch (error) {
      console.error("Forgot password error:", error)
      toast({
        title: "Error",
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
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              "Send Reset Link"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
