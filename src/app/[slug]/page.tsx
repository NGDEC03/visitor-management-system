
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashBoard } from "@/components/dashboard"
import { notFound, redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

interface PageProps {
  params: {
    slug: string
  }
}

export default async function Page({ params }: PageProps) {
  params=await params
  const role =params.slug

  if (role === null) {
    notFound()
  }
  

  return (
    <DashboardLayout role={role}>
      <DashBoard />
          </DashboardLayout>
  )
}
