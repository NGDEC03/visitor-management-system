"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle, Clock, Loader2, MoreHorizontal, Search, Shield, Smile, UserCheck, UserX, XCircle } from "lucide-react"
import { redirect, usePathname, useRouter } from "next/navigation"
import { format } from "date-fns"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { serviceProvider } from "@/services/serviceProvider"
import { generateQRCode } from "@/utils/generateQRCode"
import { useSession } from "next-auth/react"
import { Visitor, VisitorStatus } from "@/services/api"
import { api } from "@/services/api"

// interface VisitorWithStatus extends Visitor {
//   qrcode: string;
//   createdAt: string;
// }

export function RecentVisitorsTable() {
  const {data:session}=useSession()
  const router = useRouter()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState(null)

  const [openPassDialog, setOpenPassDialog] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [visitorPassData, setVisitorPassData] = useState(null)

  const visitorService = serviceProvider.getVisitorService()

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        console.log("fetching visitors");
        const data = await visitorService.getVisitors(session?.user?.id);
        console.log(data);
        
        const visitorsWithStatus = data.map(visitor => ({
          ...visitor,
          status: visitor.status,
          checkIn: visitor.checkInTime || ""
        }))
        
        setVisitors(visitorsWithStatus as any)
      } catch (error) {
        toast.error("Failed to fetch visitors")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisitors()
  }, [session?.user?.id])

  const filteredVisitors = useMemo(() => {
    return visitors.filter(
      (visitor:any) =>
        visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.department.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, visitors])

  const handleCheckIn = async (id: string) => {
    redirect("/check-in-out")
      
  }

  const handleCheckOut = async (id: string) => {
    redirect("/check-in-out")
  }

  const handleExport = async () => {
    try {
      const blob = await api.exportVisitors()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'visitors.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Visitors exported successfully")
    } catch (error) {
      toast.error("Failed to export visitors")
      console.error(error)
    }
  }

  const handlePrintPass = async (visitor) => {
    if(visitor.status === "cancelled") {
      toast.error("Visit already cancelled")
      return
    }
    if(visitor.status==="pending"){
      toast.error("Visit not approved")
      return
    }
   
    setOpenPassDialog(true)
    setPassLoading(true)
    try {
      const passData = await visitorService.getVisitorDetails(visitor.email as string)
      console.log(passData);
      const qrcode=await generateQRCode(passData)
      setVisitorPassData({ ...passData, status: visitor.status, checkIn: passData.checkInTime || "",qrcode:qrcode })
    } catch (error) {
      toast.error("Failed to generate pass")
      console.error(error)
    } finally {
      visitorService.updateVisitor(visitor.id as string,"checked-in")
      setPassLoading(false)
    }
  }

  const downloadPass = async () => {
    const element = document.getElementById('visitor-pass')
    if (!element || typeof window === 'undefined') return
  
    try {
      const html2pdf = (await import('html2pdf.js')).default
  
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${visitorPassData?.name}-visitor-pass.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 4, 
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: true,
          removeContainer: true 
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: false 
        }
      }
  
      await html2pdf().from(element).set(opt).save()
      toast.success('Pass downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }
  

  const handleCancelVisit = async (id: string) => {
    console.log(id);
    
    const visitor = visitors.find(v => v.id === id)
    if(visitor?.status==='cancelled'){
      toast.error("Visit already cancelled")
      return
    }
    if(visitor?.status==="checked_in"){
      toast.error("Visit already checked in")
      return
    }
    if(visitor?.status==="checked_out"){
      toast.error("Visit already checked out")
      return
    }
    try {
      await visitorService.updateVisitor(id,"cancelled")
      toast.success("Visit cancelled successfully")
      setVisitors(visitors.map(v => v.id === id ? {...v, status: "cancelled"} : v))
    } catch (error) {
      toast.error("Failed to cancel visit")
      console.error(error)
    }
  }
const renderStatusBadge = (status) => {
 
  const icon =
    status === "checked_in" ? <UserCheck className="h-3 w-3 text-green-500" /> :
    status === "checked_out" ? <UserX className="h-3 w-3 text-gray-500" /> :
    status === "pre_approved" ? <Shield className="h-3 w-3 text-blue-500" /> :
    status === "approved" ? <CheckCircle className="h-3 w-3 text-teal-500" /> :
    status === "pending" ? <Clock className="h-3 w-3 text-yellow-500" /> :
    status === "cancelled" ? <XCircle className="h-3 w-3 text-red-500" /> :
    <XCircle className="h-3 w-3 text-gray-500" /> 

  return (
    <Badge className={`flex w-24 justify-center items-center gap-1 ${getStatusBadgeClass(status)}`}>
      {icon}
      <span className="capitalize">{status}</span>
    </Badge>
  )
}
const getStatusBadgeClass = (status) => {
  switch(status) {
    case "checked_in":
      return "bg-green-100 text-green-600";
    case "checked_out":
      return "bg-gray-100 text-gray-600";
    case "pre_approved":
      return "bg-blue-100 text-blue-600";
    case "approved":
      return "bg-teal-100 text-teal-600";
    case "pending":
      return "bg-yellow-100 text-yellow-600"; 
    case "cancelled":
      return "bg-red-100 text-red-600";
    default:
      return "";
  }
}

  

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search visitors..."
            className="pl-8 max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>
          <Button size="sm" onClick={() => router.push(`/${session?.user?.role}/visitor-registration`)}>
            Add Visitor
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No visitors found
                </TableCell>
              </TableRow>
            ) : (
              filteredVisitors.map((visitor) => (
                <TableRow key={visitor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={visitor.photo} alt={visitor.name} />
                        <AvatarFallback>
                          {visitor.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {visitor.name}
                    </div>
                  </TableCell>
                  <TableCell>{visitor.company}</TableCell>
                  <TableCell>{visitor.purpose}</TableCell>
                  <TableCell>{visitor.department}</TableCell>
                  <TableCell>
                    {visitor.checkIn ? format(new Date(visitor.checkIn), "PPP p") : "--"}
                  </TableCell>
                  <TableCell>{renderStatusBadge(visitor.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedVisitor(visitor)
                            setOpenDialog(true)
                          }}
                        >
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintPass(visitor)}>
                          Print pass
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem className="text-destructive" onClick={() => handleCancelVisit(visitor.id)}>
                          Cancel visit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
            <DialogDescription>
              All information related to this visitor.
            </DialogDescription>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {selectedVisitor.name}</div>
              <div><strong>Email:</strong> {selectedVisitor.email}</div>
              <div><strong>Company:</strong> {selectedVisitor.company}</div>
              <div><strong>Purpose:</strong> {selectedVisitor.purpose}</div>
              <div><strong>Department:</strong> {selectedVisitor.department}</div>
              <div><strong>Status:</strong> {selectedVisitor.status}</div>
              <div><strong>Check-In:</strong> {selectedVisitor.checkIn ? format(new Date(selectedVisitor.checkIn), "PPP p") : "--"}</div>
              <div><strong>Check-Out:</strong> {selectedVisitor.checkOutTime ? format(new Date(selectedVisitor.checkOutTime), "PPP p") : "--"}</div>
          
              <div className="flex gap-2 items-center">
                <strong>Photo:</strong>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedVisitor.photo} alt={selectedVisitor.name} />
                  <AvatarFallback>
                    {selectedVisitor.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visitor Pass Dialog */}
      <Dialog open={openPassDialog} onOpenChange={setOpenPassDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visitor Pass</DialogTitle>
            <DialogDescription>This pass can be printed and issued at the gate.</DialogDescription>
          </DialogHeader>

          {passLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800" />
            </div>
          ) : visitorPassData ? (
            <>
              <div
  id="visitor-pass"
  className="p-6 border rounded-xl space-y-4 text-sm bg-white text-black shadow-md max-w-md mx-auto"
>
  <div className="flex items-center gap-4">
    <Avatar className="h-20 w-20">
      <AvatarImage src={visitorPassData.photo} alt={visitorPassData.name} />
      <AvatarFallback>
        {visitorPassData.name.split(" ").map((n) => n[0]).join("")}
      </AvatarFallback>
    </Avatar>
    <div>
      <div className="font-semibold text-xl">{visitorPassData.name}</div>
      <div className="text-sm text-muted-foreground">{visitorPassData.company}</div>
      <div className="text-sm text-muted-foreground">{visitorPassData.email}</div>
    </div>
  </div>

  <div className="text-base"><strong>Purpose:</strong> {visitorPassData.purpose}</div>
  <div className="text-base"><strong>Department:</strong> {visitorPassData.department}</div>
  <div className="text-base"><strong>Status:</strong> {visitorPassData.status}</div>
  <div className="text-base"><strong>Check-In:</strong> {visitorPassData.checkIn ? format(new Date(visitorPassData.checkIn), "PPP p") : "--"}</div>
  <div className="text-base"><strong>Check-Out:</strong> {visitorPassData.checkOutTime ? format(new Date(visitorPassData.checkOutTime), "PPP p") : "--"}</div>

  <div className="pt-4 flex justify-center">
    <img 
      src={visitorPassData.qrcode} 
      alt="QR Code" 
      className="w-64 h-64 object-contain mx-auto"
      style={{
        imageRendering: 'pixelated',
        backgroundColor: 'white',
        padding: '8px'
      }}
    />
  </div>
</div>


              <DialogFooter className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setOpenPassDialog(false)}>
                  Close
                </Button>
                <Button onClick={downloadPass}>
                  Download Pass (PDF)
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">No pass data available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
