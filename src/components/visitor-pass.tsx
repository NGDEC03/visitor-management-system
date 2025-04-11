"use client"

import { Download, Printer, Share2 } from "lucide-react"
import QRCode from "react-qr-code"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface VisitorPassProps {
  id: string
}

export function VisitorPass({ id }: VisitorPassProps) {
  // In a real app, you would fetch the visitor data based on the ID
  const visitorData = {
    id,
    name: "John Smith",
    company: "Acme Inc.",
    purpose: "Meeting",
    host: "Sarah Johnson",
    department: "Marketing",
    arrivalTime: "10:30 AM",
    departureTime: "11:30 AM",
    date: "April 9, 2025",
    photo: "/placeholder.svg?height=100&width=100",
    qrValue: `VISITOR-${id}-${Date.now()}`,
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert("Downloading visitor pass as PDF...")
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert("Sharing visitor pass...")
  }

  return (
    <div className="flex flex-col items-center max-w-md mx-auto">
      <Card className="w-full shadow-lg print:shadow-none">
        <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-2xl">Visitor Pass</CardTitle>
          <CardDescription className="text-primary-foreground/80">Valid for {visitorData.date}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={visitorData.photo} alt={visitorData.name} />
              <AvatarFallback className="text-2xl">
                {visitorData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{visitorData.name}</h2>
            <p className="text-muted-foreground">{visitorData.company}</p>
          </div>

          <div className="w-full space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purpose:</span>
              <span className="font-medium">{visitorData.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Host:</span>
              <span className="font-medium">{visitorData.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{visitorData.department}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time Window:</span>
              <span className="font-medium">
                {visitorData.arrivalTime} - {visitorData.departureTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{visitorData.date}</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border mb-4">
            <QRCode value={visitorData.qrValue} size={180} className="mx-auto" />
          </div>

          <Badge variant="outline" className="text-sm px-3 py-1">
            Visitor ID: {visitorData.id}
          </Badge>
        </CardContent>
        <CardFooter className="flex justify-center gap-2 border-t pt-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground print:hidden">
        <p>Please present this pass at the security desk upon arrival.</p>
        <p>This pass is valid only for the date and time specified.</p>
      </div>
    </div>
  )
}
