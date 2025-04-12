"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CheckInOutScreen } from "@/components/check-in-out-screen"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { UserRole } from "@/generated/prisma"

export default function CheckInOutPage() {
  const {data:session}=useSession()
  const pathname=usePathname()
  const slug=pathname.split("/")[1]
  return (
    <DashboardLayout role={slug as UserRole}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Check-In / Check-Out</h1>
        <CheckInOutScreen />
      </div>
    </DashboardLayout>
  )
}
