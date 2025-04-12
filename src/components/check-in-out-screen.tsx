"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, CheckSquare, QrCode, UserCheck, UserMinus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VisitorService } from "@/services/visitorService"

export function CheckInOutScreen() {
  const visitorService = new VisitorService()
  const { toast } = useToast()
  const [visitorId, setVisitorId] = useState("")
  const [scanActive, setScanActive] = useState(false)
  const [visitorData, setVisitorData] = useState<any>(null)
  const qrRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  const fetchVisitorData = async (id: string) => {
    try {
      const res = await visitorService.getVisitorDetails(id)
      setVisitorData(res)
      toast({ title: "Visitor found", description: "Visitor info retrieved successfully" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    }
  }

  const handleManualCheckIn = () => {
    if (!visitorId) {
      toast({
        title: "Error",
        description: "Please enter a visitor ID",
      })
      return
    }
    fetchVisitorData(visitorId)
  }

  const startQrScanner = async () => {
    if (scanActive || !qrRef.current) return

    const qrRegionId = qrRef.current.id
    setScanActive(true)

    const qrCodeScanner = new Html5Qrcode(qrRegionId)
    html5QrCodeRef.current = qrCodeScanner

    try {
      await qrCodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          console.log(decodedText);
          
          try {
            const parsed = JSON.parse(decodedText)
    
            if (parsed?.id) {
              await qrCodeScanner.stop()
              qrCodeScanner.clear()
              setScanActive(false)
              fetchVisitorData(parsed.id)
            } else {
              throw new Error("Invalid QR payload: missing ID")
            }
          } catch (err) {
            console.error("Invalid QR code format", err)
            toast({
              title: "Invalid QR Code",
              description: "Please scan a valid visitor QR with proper ID.",
            })
            setScanActive(false)
          }
        },
        (errorMessage:string) => {
          console.log("Scan error:", errorMessage)
        }
      )
    } catch (err: any) {
      toast({ title: "Error", description: "QR scanning failed" })
      setScanActive(false)
    }
    
  }

  const stopQrScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop()
      await html5QrCodeRef.current.clear()
      setScanActive(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      const res = await visitorService.updateVisitor(visitorData.id, "checked_in")
      setVisitorData((prev: any) => ({
        ...prev,
        status: "checked-in",
        actualArrival: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
      toast({ title: "Checked In", description: `${visitorData.name} is now checked in.` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    }
  }

  const handleCheckOut = async () => {
    try {
      const res = await visitorService.updateVisitor(visitorData.id, "checked_out")
      setVisitorData((prev: any) => ({
        ...prev,
        status: "checked-out",
        actualDeparture: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
      toast({ title: "Checked Out", description: `${visitorData.name} has checked out.` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    }
  }

  const resetVisitor = () => {
    setVisitorId("")
    setVisitorData(null)
  }

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear())
      }
    }
  }, [])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Check-In/Out</CardTitle>
          <CardDescription>Scan a QR code or enter a visitor ID to check in or out</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scan" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <div id="qr-reader" ref={qrRef} className="w-full h-full" />
                </div>
                <Button onClick={startQrScanner} disabled={scanActive} className="w-full">
                  {scanActive ? "Scanning..." : "Start Scanning"}
                </Button>
                <Button onClick={stopQrScanner} variant="outline" disabled={!scanActive} className="w-full">
                  Stop Scanning
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label htmlFor="visitorId" className="text-sm font-medium">
                    Visitor ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="visitorId"
                      placeholder="Enter visitor ID"
                      value={visitorId}
                      onChange={(e) => setVisitorId(e.target.value)}
                    />
                    <Button onClick={handleManualCheckIn}>Find</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Information</CardTitle>
          <CardDescription>View visitor details and check in/out status</CardDescription>
        </CardHeader>
        <CardContent>
          {visitorData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={visitorData.photo} alt={visitorData.name} />
                  <AvatarFallback>
                    {visitorData.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{visitorData.name}</h3>
                  <p className="text-sm text-muted-foreground">{visitorData.company}</p>
                  <Badge
                    variant={
                      visitorData.status === "checked-in"
                        ? "default"
                        : visitorData.status === "checked-out"
                          ? "secondary"
                          : "outline"
                    }
                    className="mt-1"
                  >
                    {visitorData.status === "checked-in"
                      ? "Checked In"
                      : visitorData.status === "checked-out"
                        ? "Checked Out"
                        : "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Purpose:</span>
                  <span className="text-sm font-medium">{visitorData.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Host:</span>
                  <span className="text-sm font-medium">{visitorData.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="text-sm font-medium">{visitorData.department}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected Time:</span>
                  <span className="text-sm font-medium">
                    {visitorData.arrivalTime} - {visitorData.departureTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{visitorData.date}</span>
                </div>

                {visitorData.status === "checked-in" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual Arrival:</span>
                    <span className="text-sm font-medium">{visitorData.actualArrival}</span>
                  </div>
                )}

                {visitorData.status === "checked-out" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actual Arrival:</span>
                      <span className="text-sm font-medium">{visitorData.actualArrival}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actual Departure:</span>
                      <span className="text-sm font-medium">{visitorData.actualDeparture}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {visitorData.status === "pending" && (
                  <Button onClick={handleCheckIn} className="w-full">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check In
                  </Button>
                )}

                {visitorData.status === "checked-in" && (
                  <Button onClick={handleCheckOut} className="w-full">
                    <UserMinus className="mr-2 h-4 w-4" />
                    Check Out
                  </Button>
                )}

                <Button variant="outline" onClick={resetVisitor} className="w-full">
                  New Visitor
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Visitor Selected</h3>
              <p className="text-sm text-muted-foreground mt-1">Scan a QR code or enter a visitor ID to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
