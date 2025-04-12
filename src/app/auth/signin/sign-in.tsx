"use client"
import type { Metadata } from "next"
import Link from "next/link"

import { SignInForm } from "@/components/auth/sign-in"
import { useSession } from "next-auth/react"
import Authenticated from "@/components/authenticated"

export const metadata: Metadata = {
  title: "Sign In | Visitor Management System",
  description: "Sign in to your VMS account",
}

export default function SignInPage() {
    const session=useSession()
    if(session.status==="authenticated"){
        return <Authenticated />
    }
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <SignInForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
