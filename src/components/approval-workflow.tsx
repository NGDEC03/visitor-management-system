"use client"

import { useState, useEffect, useMemo } from "react"
import { CheckCircle, Filter, Loader2, Search, XCircle, Clock } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { serviceProvider } from "@/services/serviceProvider"
import { Visitor, VisitorStatus } from "@/services/api"
import { LoadingSpinner } from "./ui/loading-spinner"

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
  pre_approved: Visitor[]
}

export function ApprovalWorkflow() {
  const {data:session}=useSession()
  const visitorService = serviceProvider.getVisitorService()
  const { toast } = useToast() 
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [status, setStatus] = useState("pending")
  const [visitors, setVisitors] = useState<VisitorsData>({
    pending: [],
    approved: [],
    rejected: [],
    pre_approved: []
  })
  
  useEffect(()=>{
    const fetchVisitors=async()=>{
      setLoading(true)
      let data:Visitor[]=[]
      console.log(session?.user?.role);
      
      if(session?.user?.role!=="admin")
       data = (await visitorService.getVisitorsByHost(session?.user?.id as string)).visitors
      else{

        data = await visitorService.getVisitors()
        console.log("admin data",data);
        
      }
      console.log(data);
      
      
      
      setVisitors({
        pending: data.filter(v => v.status === VisitorStatus.PENDING),
        approved: data.filter(v => v.status === VisitorStatus.APPROVED),
        rejected: data.filter(v => v.status === VisitorStatus.CANCELLED),
        pre_approved: data.filter(v => v.status === VisitorStatus.PRE_APPROVED)
      })

   
      
    }
    fetchVisitors()
    setLoading(false)
  },[])

  const handleApprove = async (visitorId: string) => {
    try {
      setLoading(true)
      const updatedVisitor = await visitorService.updateVisitor(visitorId, VisitorStatus.APPROVED)
      setVisitors(prev => ({
        ...prev,
        pending: prev.pending.filter(v => v.id !== visitorId),
        approved: [...prev.approved, updatedVisitor]
      }))
      toast({
        title: "Visitor approved",
        description: "The visitor has been approved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve visitor. Please try again.",
      })
    }
    finally{
      setLoading(false)
    } 
  }

  const handleReject = async (visitorId: string) => {
    try {
      setLoading(true)
      const updatedVisitor = await visitorService.updateVisitor(visitorId, "cancelled")
      setVisitors(prev => ({
        ...prev,
        pending: prev.pending.filter(v => v.id !== visitorId),
        rejected: [...prev.rejected, updatedVisitor]
      }))
      toast({
        title: "Visitor rejected",
        description: "The visitor has been rejected.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject visitor. Please try again.",
      })
    }
    finally{
      setLoading(false)
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

  const filteredVisitors = useMemo(() => {
    let filtered: Visitor[] = []
    switch (status) {
      case "pending":
        filtered = visitors.pending
        break
      case "approved":
        filtered = visitors.approved
        break
      case "rejected":
        filtered = visitors.rejected
        break
      case "pre_approved":
        filtered = visitors.pre_approved
        break
      case "all":
        filtered = [...visitors.pending, ...visitors.pre_approved, ...visitors.approved, ...visitors.rejected]
        break
      default:
        filtered = visitors.pending
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [visitors, searchQuery, status])

  const showTabs = session?.user?.role === "admin" 
    ? ["pending", "approved", "rejected", "all"]
    : session?.user?.role === "employee" 
      ? ["pending", "pre_approved", "approved", "rejected"] 
      : ["pending", "approved", "rejected", "all"]

  // if (loading) {
  //   return <div className="flex justify-center items-center h-screen">
  //     <Loader2 className="h-8 w-8 animate-spin" />
  //   </div>
  // }
if(loading){
 return <LoadingSpinner/>
}
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Approval Workflow</CardTitle>
          <CardDescription>
            {session?.user?.role === "admin"
              ? "Review and manage all visitor requests"
              : "Review and track visitor requests for your department"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" onValueChange={setStatus}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                {showTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab === "pre_approved" ? "Pre-Approved" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab !== "all" && (
                      <Badge variant="outline" className="ml-2">
                        {tab === "pending" 
                          ? visitors.pending.length 
                          : tab === "approved" 
                            ? visitors.approved.length 
                            : tab === "rejected" 
                              ? visitors.rejected.length 
                              : tab === "pre_approved" 
                                ? visitors.pre_approved.length 
                                : 0}
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
                
              </div>
            </div>

            {showTabs.map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0">
                <VisitorTable
                  visitors={filteredVisitors}
                  showActions={tab === "pending"}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  loading={loading}
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
                {[...visitors.approved, ...visitors.rejected].length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No visitors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...visitors.approved, ...visitors.rejected].map((visitor) => (
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
                      <TableCell>{visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : "--"}</TableCell>
                      <TableCell>{visitor.department}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            visitor.status === VisitorStatus.APPROVED
                              ? "default"
                              : "secondary"
                          }
                          className="flex w-24 justify-center items-center gap-1"
                        >
                          {visitor.status === VisitorStatus.APPROVED ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          <span className="capitalize">
                            {visitor.status === VisitorStatus.APPROVED
                              ? "Approved"
                              : "Rejected"}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleDateString() : "--"}</TableCell>
                    </TableRow>
                  ))
                )}
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
  loading: boolean
}

function VisitorTable({ visitors, showActions, onApprove, onReject, loading }: VisitorTableProps) {
  return (
    <div className="rounded-md border relative min-h-[150px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Visitor</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Arrival Time</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading visitors...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : visitors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">
                No visitors found.
              </TableCell>
            </TableRow>
          ) : (
            visitors.map((visitor) => (
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
                <TableCell>{visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : "--"}</TableCell>
                <TableCell>{visitor.department}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      visitor.status === VisitorStatus.PRE_APPROVED
                        ? "default"
                        : visitor.status === VisitorStatus.APPROVED
                          ? "default"
                          : visitor.status === VisitorStatus.REJECTED
                            ? "secondary"
                            : "outline"
                    }
                    className="flex w-24 justify-center items-center gap-1"
                  >
                    {visitor.status === VisitorStatus.PRE_APPROVED ? (
                      <CheckCircle className="h-3 w-3 text-yellow-500" />
                    ) : visitor.status === VisitorStatus.APPROVED ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : visitor.status === VisitorStatus.REJECTED ? (
                      <XCircle className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span className="capitalize">
                      {visitor.status === VisitorStatus.PRE_APPROVED
                        ? "Pre-Approved"
                        : visitor.status === VisitorStatus.APPROVED
                          ? "Approved"
                          : visitor.status === VisitorStatus.REJECTED
                            ? "Rejected"
                            : "Pending"}
                    </span>
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex gap-2">
                      {onApprove && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-green-500 hover:text-green-700 hover:bg-green-50"
                          onClick={() => onApprove(visitor.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      )}
                      {onReject && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onReject(visitor.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      )}
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