"use client"

import { useState, useEffect, useMemo } from "react"
import { CheckCircle, Filter, Search, XCircle } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { VisitorService } from "@/services/visitorService"

interface Visitor {
  id: string
  name: string
  purpose: string
  host: string
  department: string
  arrivalTime: string
  photo: string
  status: "pending" | "approved" | "rejected"
}

interface SessionUser {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  department?: string
}

interface VisitorsData {
  pending: Visitor[]
  approved: Visitor[]
  rejected: Visitor[]
}

export function ApprovalWorkflow() {
  const {data:session}=useSession()
    
  const visitorService=new VisitorService()
  const { toast } = useToast() 
  
  const [searchQuery, setSearchQuery] = useState("")
  const [status, setStatus] = useState("pending")
  const [visitors, setVisitors] = useState<VisitorsData>({
    pending: [],
    approved: [],
    rejected: []
  })

  useEffect(()=>{
    const fetchVisitors=async()=>{
      const visitors=await (session?.user?.role==="security" || session?.user?.role==="admin"?visitorService.getVisitors():visitorService.getVisitorsByHost(session?.user?.id as string))
      visitors.forEach((visitor:any)=>{
        if(visitor.status==="pending"){
          setVisitors((prev)=>({...prev,pending:[...prev.pending,visitor]}))
        }
        else if(visitor.status==="approved"){
          setVisitors((prev)=>({...prev,approved:[...prev.approved,visitor]}))
        }
        else if(visitor.status==="rejected"){
          setVisitors((prev)=>({...prev,rejected:[...prev.rejected,visitor]}))
        }
      })
    }
    fetchVisitors()
  },[])

  const handleApprove = async (visitorId: string) => {
    try {
      const updatedVisitor=await visitorService.updateVisitor(visitorId,"approved")
      toast({
        title: "Visitor approved",
        description: "The visitor has been approved and notified.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve visitor"
      })
    }
  }

  const handleReject = async (visitorId: string) => {
    try {
      const updatedVisitor=await visitorService.updateVisitor(visitorId,"rejected")
      toast({
        title: "Visitor rejected",
        description: "The visitor has been rejected and notified.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject visitor"
      })
    }
  }

  const getVisitorsByStatus = () => {
    switch (status) {
      case "pending":
        return visitors.pending
      case "approved":
        return visitors.approved
      case "rejected":
        return visitors.rejected
      default:
        return [...visitors.pending, ...visitors.approved, ...visitors.rejected]
    }
  }

  const filteredVisitors = getVisitorsByStatus().filter(
    (visitor: Visitor) =>
      visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const showTabs = session?.user?.role === "admin" 
    ? ["pending", "approved", "rejected", "all"]
    : ["pending"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Approval Workflow</CardTitle>
          <CardDescription>
            {session?.user?.role === "admin" 
              ? "Review and manage all visitor requests"
              : "Review visitor requests for your department"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" onValueChange={setStatus}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                {showTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab !== "all" && (
                      <Badge variant="outline" className="ml-2">
                        {visitors[tab as keyof typeof visitors].length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex w-full sm:w-auto gap-2">
                <Input
                  placeholder="Search visitors..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showTabs.map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0">
                <VisitorTable
                  visitors={filteredVisitors}
                  showActions={tab === "pending"}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      
        <Card>
          <CardHeader>
            <CardTitle>Visitor History</CardTitle>
            <CardDescription>View a history of all visitors you've approved or rejected</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Arrival Time</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  )
}

interface VisitorTableProps {
  visitors: Visitor[]
  showActions: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

function VisitorTable({ visitors, showActions, onApprove, onReject }: VisitorTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Visitor</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Host</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Arrival Time</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">
                No visitors found.
              </TableCell>
            </TableRow>
          ) : (
            visitors.map((visitor: Visitor) => (
              <TableRow key={visitor.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={visitor.photo} alt={visitor.name} />
                      <AvatarFallback>
                        {visitor.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{visitor.name}</div>
                  </div>
                </TableCell>
                <TableCell>{visitor.purpose}</TableCell>
                <TableCell>{visitor.host}</TableCell>
                <TableCell>{visitor.department}</TableCell>
                <TableCell>{visitor.arrivalTime}</TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-green-500 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onApprove?.(visitor.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onReject?.(visitor.id)}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
