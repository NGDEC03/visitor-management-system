"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ApprovalWorkflow } from "@/components/approval-workflow"
import { UserRole } from "@/generated/prisma"
import { usePathname } from "next/navigation"

export default function ApprovalWorkflowPage() {
  const pathname=usePathname()
  const slug=pathname.split("/")[1]
  return (
    <DashboardLayout role={slug as UserRole}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Approval Workflow</h1>
        <ApprovalWorkflow />
      </div>
    </DashboardLayout>
  )
}
