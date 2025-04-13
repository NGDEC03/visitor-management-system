"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CheckSquare, QrCode, UserCheck, UserMinus, CheckCircle, XCircle, Clock } from "lucide-react"
import jsQR from "jsqr"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { serviceProvider } from "@/services/serviceProvider"
import { Visitor, VisitorStatus } from "@/services/api"

export function CheckInOutScreen() {
  const { data: session } = useSession()
  const visitorService = serviceProvider.getVisitorService()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [loading, setLoading] = useState(false)
  const [scanActive, setScanActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const fetchVisitorData = async (email: string) => {
    try {
      const res = await visitorService.getVisitorDetails(email)
      setVisitor(res)
      toast({ title: "Visitor found", description: "Visitor info retrieved successfully" })
    } catch (err: any) {
      toast({ title: "Visitor Not Found", description: err.message })
    }
  }

  const handleManualCheckIn = () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a visitor Email",
      })
      return
    }
    fetchVisitorData(email)
  }

  const startQrScanner = async () => {
    if (scanActive || !videoRef.current || !canvasRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      setScanActive(true)

      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (!context) return

      const scanFrame = () => {
        if (!videoRef.current || !canvasRef.current || !context || !scanActive) return

        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          try {
            const parsed = JSON.parse(code.data)
            if (parsed?.id) {
              stopQrScanner()
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
          }
        }

        if (scanActive) {
          requestAnimationFrame(scanFrame)
        }
      }

      scanFrame()
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to access camera" })
      setScanActive(false)
    }
  }

  const stopQrScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanActive(false)
  }

  const handleCheckIn = async () => {
    try {
      const res = await visitorService.updateVisitor(visitor!.id, "checked_in")
      setVisitor((prev: any) => ({
        ...prev,
        status: "checked-in",
        actualArrival: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
      toast({ title: "Checked In", description: `${visitor!.name} is now checked in.` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    }
  }

  const handleCheckOut = async () => {
    try {
      const res = await visitorService.updateVisitor(visitor!.id, "checked_out")
      setVisitor((prev: any) => ({
        ...prev,
        status: "checked-out",
        actualDeparture: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }))
      toast({ title: "Checked Out", description: `${visitor!.name} has checked out.` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message })
    }
  }

  const resetVisitor = () => {
    setEmail("")
    setVisitor(null)
  }

  useEffect(() => {
    return () => {
      stopQrScanner()
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
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
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
                      id="visitorEmail"
                      placeholder="Enter visitor Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
          {visitor ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={visitor.photo} alt={visitor.name} />
                  <AvatarFallback>
                    {visitor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{visitor.name}</h3>
                  <p className="text-sm text-muted-foreground">{visitor.company}</p>
                  <Badge
                    variant={
                      visitor.status === "checked-in"
                        ? "default"
                        : visitor.status === "checked-out"
                          ? "secondary"
                          : visitor.status === "pre_approved"
                            ? "default"
                            : visitor.status === "approved"
                              ? "default"
                              : "outline"
                    }
                    className="flex w-24 justify-center items-center gap-1"
                  >
                    {visitor.status === "checked-in" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : visitor.status === "checked-out" ? (
                      <XCircle className="h-3 w-3" />
                    ) : visitor.status === "pre_approved" ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : visitor.status === "approved" ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    <span className="capitalize">
                      {visitor.status === "checked_in"
                        ? "Checked In"
                        : visitor.status === "checked_out"
                          ? "Checked Out"
                          : visitor.status === "pre_approved"
                            ? "Pre Approved"
                            : visitor.status === "approved"
                              ? "Approved"
                              : "Pending"}
                    </span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Purpose:</span>
                  <span className="text-sm font-medium">{visitor.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Host:</span>
                  <span className="text-sm font-medium">{visitor.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Department:</span>
                  <span className="text-sm font-medium">{visitor.department}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expected Time:</span>
                  <span className="text-sm font-medium">
                    {visitor.arrivalTime} - {visitor.departureTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">{visitor.date}</span>
                </div>

                {visitor.status === "checked-in" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual Arrival:</span>
                    <span className="text-sm font-medium">{visitor.actualArrival}</span>
                  </div>
                )}

                {visitor.status === "checked-out" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actual Arrival:</span>
                      <span className="text-sm font-medium">{visitor.actualArrival}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Actual Departure:</span>
                      <span className="text-sm font-medium">{visitor.actualDeparture}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  {(visitor.status === "approved" || visitor.status === "pre_approved") && (
                    <Button onClick={handleCheckIn} className="w-full">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Check In
                    </Button>
                  )}

                  {visitor.status === "checked_in" && (
                    <Button onClick={handleCheckOut} className="w-full">
                      <UserMinus className="mr-2 h-4 w-4" />
                      Check Out
                    </Button>
                  )}
                </div>

                <Separator />

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
