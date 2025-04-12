"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { RecentVisitorsTable } from "@/components/recent-visitor-table"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { UserRole } from "@/generated/prisma"
export default function VisitorDetailsPage() {
  const {data:session}=useSession()
  const pathname=usePathname()
  const slug=pathname.split("/")[1]
  return (
    <DashboardLayout role={slug as UserRole}>
      <div className="container mx-auto py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Visitor Details</h1>
        <RecentVisitorsTable />
      </div>
    </DashboardLayout>
  )
} 