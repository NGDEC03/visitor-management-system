"use client"

import { Calendar, CheckCircle, Clock, Loader2, Users, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VisitorFlowChart, visitorFlowDataProp } from "@/components/visitor-flow-chart"
import { DepartmentVisitorChart } from "@/components/department-visitor-chart"
import { RecentVisitorsTable } from "@/components/recent-visitor-table"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { VisitorService } from "@/services/visitorService"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import UnAuthorized from "./unAuthorized"
import { visitorDataProp, visitorStatusProp } from "@/types/visitor"

export function DashBoard() {
  const router = useRouter()
  const pathname=usePathname()
  const [visitorData, setVisitorData] = useState<visitorDataProp | null>(null)
  const [visitorStatus, setVisitorStatus] = useState<visitorStatusProp | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const {data:session} = useSession()
  console.log(session);
  
  const visitorService = new VisitorService()

  useEffect(() => {
    async function getDashBoardData(){
      if(session?.user?.id){
        try {
          setIsLoading(true)
          const [totalVisitors, visitorsStatus] = await Promise.all([
            session?.user?.role==="security" || session?.user?.role==="admin"?visitorService.getTotalVisitors(""):visitorService.getTotalVisitors(session.user.id),
            session?.user?.role==="security" || session?.user?.role==="admin"?visitorService.getVisitorsStatus(""):visitorService.getVisitorsStatus(session.user.id),
         
          ])
          console.log("here are details",totalVisitors,visitorsStatus);
          setVisitorData(totalVisitors)
          setVisitorStatus(visitorsStatus as any)
    
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    getDashBoardData()
  }, [session?.user?.id])

  if(session?.status === "unauthenticated"){
    router.push("/auth/signin")
    return null
  }

  if(session?.status === "loading" || isLoading){
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
