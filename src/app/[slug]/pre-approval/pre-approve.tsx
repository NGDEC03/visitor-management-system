"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PreApprovalForm } from "@/components/pre-approval-form"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { UserRole } from "@/generated/prisma"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function PreApprovalPage() {
  const { data: session, status } = useSession()
  const pathname=usePathname()
  const slug=pathname.split("/")[1]
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <DashboardLayout role={slug as UserRole}>
      <div className="container mx-auto flex flex-col items-center py-6">
        <h1 className="text-3xl font-bold mb-6">Pre-Approval Scheduling</h1>
        <PreApprovalForm />
      </div>
    </DashboardLayout>
  )
}
