"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { VisitorRegistrationForm } from "@/components/visitor-registration-form"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { UserRole } from "@/generated/prisma"
import { notFound } from "next/navigation"

export default function VisitorRegistrationPage() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const slug = pathname.split("/")[1]

  if (!session?.user) {
    return null
  }

  if (session.user.role !== "security" && session.user.role !== "admin") {
    notFound()
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div className="container mx-auto py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Visitor Registration</h1>
        <VisitorRegistrationForm />
      </div>
    </DashboardLayout>
  )
}
