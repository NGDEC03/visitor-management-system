"use client"

import { Calendar, CheckCircle, Clock, Loader2, Users, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitorFlowChart, visitorFlowDataProp } from "@/components/visitor-flow-chart"
import { DepartmentVisitorChart } from "@/components/department-visitor-chart"
import { RecentVisitorsTable } from "@/components/recent-visitor-table"
import { useSession } from "next-auth/react"
import { useEffect, useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import UnAuthorized from "./unAuthorized"
import { visitorDataProp, visitorStatusProp } from "@/types/visitor"
import useSWR from "swr"
import { serviceProvider } from "@/services/serviceProvider"
import { Visitor, VisitorStatus } from "@/services/api"

interface DashboardData {
  totalVisitors: visitorDataProp
  visitorsStatus: visitorStatusProp
}

export function DashBoard() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useSession()
  const visitorService = serviceProvider.getVisitorService()
  
  // Use SWR for data fetching with caching
  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>(
    session?.user?.id ? ['/api/dashboard', session.user.id] : null,
    async () => {
      const userId = session?.user?.id || ""
      const [totalVisitors, visitorsStatus] = await Promise.all([
        session?.user?.role === "security" || session?.user?.role === "admin" 
          ? visitorService.getTotalVisitors("")
          : visitorService.getTotalVisitors(userId),
        session?.user?.role === "security" || session?.user?.role === "admin"
          ? visitorService.getVisitorsStatus("")
          : visitorService.getVisitorsStatus(userId)
      ])
      return { totalVisitors, visitorsStatus }
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 
    }
  )

  const visitorData = useMemo(() => dashboardData?.totalVisitors || null, [dashboardData])
  const visitorStatus = useMemo(() => dashboardData?.visitorsStatus || null, [dashboardData])

  const [visitors, setVisitors] = useState<Visitor[]>([])

  useEffect(() => {
    const fetchVisitors = async () => {
      const data = await visitorService.getVisitors()
      setVisitors(data)
    }
    fetchVisitors()
  }, [])

  const pendingVisitors = visitors.filter(v => v.status === VisitorStatus.PENDING)
  const approvedVisitors = visitors.filter(v => v.status === VisitorStatus.APPROVED)
  const rejectedVisitors = visitors.filter(v => v.status === VisitorStatus.REJECTED)

  if (sessionStatus === "unauthenticated") {
    router.push("/auth/signin")
    return null
  }

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
       

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorData?.totalVisitorsToday || 0}</div>
                <p className="text-xs text-muted-foreground">+18% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorStatus?.status?.approved || 0}</div>
                <p className="text-xs text-muted-foreground">85.7% approval rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorStatus?.status?.pending || 0}</div>
                <p className="text-xs text-muted-foreground">9.5% awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visitorStatus?.status?.rejected || 0}</div>
                <p className="text-xs text-muted-foreground">4.8% rejection rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-1">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Visitor Flow</CardTitle>
                <CardDescription>Visitor traffic over time</CardDescription>
              </CardHeader>
              <CardContent>
                <VisitorFlowChart />
              </CardContent>
            </Card>

          {
            pathname.includes("admin") && (
              <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Visitors by department</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentVisitorChart />
              </CardContent>
            </Card>
          
            )
          }
          </div>

          {
            (pathname.includes("admin") || pathname.includes("security")) && (
              <Card>
            <CardHeader>
              <CardTitle>Recent Visitors</CardTitle>
              <CardDescription>Latest visitor check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentVisitorsTable />
            </CardContent>
          </Card>
            )
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
