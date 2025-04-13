
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashBoard } from "@/components/dashboard"
import { notFound, redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import NotFound from "../not-found"

interface PageProps {
  params: {
    slug: string
  }
}

export default async function Page({ params }: PageProps) {
  params=await params
  const role =params.slug

  if (role === null || (role !== "security" && role !== "admin" && role !== "employee")) {
   return <NotFound/>
  }
  

  return (
    <DashboardLayout role={role}>
      <DashBoard />
          </DashboardLayout>
  )
}
