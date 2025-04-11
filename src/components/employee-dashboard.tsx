"use client"

import { Calendar, CheckCircle, Clock, Users, XCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VisitorFlowChart } from "@/components/visitor-flow-chart"
import { DepartmentVisitorChart } from "@/components/department-visitor-chart"
import { RecentVisitorsTable } from "@/components/recent-visitor-table"
import { FCMTokenRegister } from "./FCM-token"
import { useSession } from "next-auth/react"

export function EmployeeDashboard() {
  const {data:session}=useSession()
  console.log(session);
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <FCMTokenRegister/>
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
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors Today</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+18% from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">36</div>
                <p className="text-xs text-muted-foreground">85.7% approval rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">9.5% awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
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

            {/* <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Visitors by department</CardDescription>
              </CardHeader>
              <CardContent>
                <DepartmentVisitorChart />
              </CardContent>
            </Card> */}
          </div>

          
        </TabsContent>
      </Tabs>
    </div>
  )
}
