"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle, Clock, MoreHorizontal, Search, XCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
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
import { api, Visitor } from "@/services/api"
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
import { VisitorService } from "@/services/visitorService"
import { generateQRCode } from "@/utils/generateQRCode"

type VisitorStatus = "pending" | "checked-in" | "checked-out" | "cancelled" | "approved"

type VisitorWithStatus = Visitor & {
  checkIn: string
  qrcode:string
}

export function RecentVisitorsTable() {
  const visitorService=new VisitorService()
  const router = useRouter()
  const [visitors, setVisitors] = useState<VisitorWithStatus[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorWithStatus | null>(null)

  // New state for "Print Pass"
  const [openPassDialog, setOpenPassDialog] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [visitorPassData, setVisitorPassData] = useState<VisitorWithStatus | null>(null)

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        console.log("fetching visitors");
        
        const data=await visitorService.getVisitors()
        console.log(data);
        
        const visitorsWithStatus: VisitorWithStatus[] = data.map(visitor => ({
          ...visitor,
          status: visitor.status as VisitorStatus,
          checkIn: visitor.checkInTime || ""
        }))
        
        setVisitors(visitorsWithStatus)
      } catch (error) {
        toast.error("Failed to fetch visitors")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVisitors()
  }, [])

  const filteredVisitors = useMemo(() => {
    return visitors.filter(
      (visitor) =>
        visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.department.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [searchQuery, visitors])

  const handleCheckIn = async (id: string) => {
    try {
      const updatedVisitor = await api.checkInVisitor(id)
      const visitorWithStatus: VisitorWithStatus = {
        ...updatedVisitor,
        status: "checked-in",
        checkIn: updatedVisitor.checkInTime || ""
      }
      setVisitors(visitors.map(v => v.id === id ? visitorWithStatus : v))
      toast.success("Visitor checked in successfully")
    } catch (error) {
      toast.error("Failed to check in visitor")
      console.error(error)
    }
  }

  const handleCheckOut = async (id: string) => {
    try {
      const updatedVisitor = await api.checkOutVisitor(id)
      const visitorWithStatus: VisitorWithStatus = {
        ...updatedVisitor,
        status: "checked-out",
        checkIn: updatedVisitor.checkInTime || ""
      }
      setVisitors(visitors.map(v => v.id === id ? visitorWithStatus : v))
      toast.success("Visitor checked out successfully")
    } catch (error) {
      toast.error("Failed to check out visitor")
      console.error(error)
    }
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

  const handlePrintPass = async (visitor: VisitorWithStatus) => {
    if(visitor.status === "cancelled") {
      toast.error("Visit already cancelled")
      return
    }
    if(visitor.status !== "approved") {
      toast.error("Visitor not approved")
      return
    }
    setOpenPassDialog(true)
    setPassLoading(true)
    try {
      const passData = await visitorService.getVisitorDetails(visitor.id as string)
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
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 3, // High-resolution rendering
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
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
    const visitor = visitors.find(v => v.id === id)
    if(visitor?.status==='cancelled'){
      toast.error("Visit already cancelled")
      return
    }
    try {
      await api.cancelVisit(id)
      toast.success("Visit cancelled successfully")
      setVisitors(visitors.map(v => v.id === id ? {...v, status: "cancelled"} : v))
    } catch (error) {
      toast.error("Failed to cancel visit")
      console.error(error)
    }
  }
  const renderStatusBadge = (status: VisitorStatus) => {
    const icon =
      status === "checked-in" ? <CheckCircle className="h-3 w-3" /> :
        status === "pending" ? <Clock className="h-3 w-3" /> :
          status === "approved" ? <CheckCircle className="h-3 w-3 text-green-500" /> :
            <XCircle className="h-3 w-3" />

    const variant =
      status === "checked-in" ? "default" :
        status === "pending" ? "outline" :
          status === "approved" ? "default" :
            "destructive"

    return (
      <Badge variant={variant} className="flex w-24 justify-center items-center gap-1">
        {icon}
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
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
          <Button size="sm" onClick={() => router.push(`/security/visitor-registration`)}>
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
                        {visitor.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleCheckIn(visitor.id)}>
                            Check in
                          </DropdownMenuItem>
                        )}
                        {visitor.status === "checked-in" && (
                          <DropdownMenuItem onClick={() => router.push(`/security/check-in-out`)}>
                            Check out
                          </DropdownMenuItem>
                        )}
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
    <img src={visitorPassData.qrcode} alt="QR Code" className="w-40 h-40 object-contain" />
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
