"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Camera, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VisitorService } from "@/services/visitorService"
import { Visitor } from "@/services/api"
import { User } from "@/generated/prisma"

export function VisitorRegistrationForm() {
  const [hosts,setHosts]=useState<User[]>([])
  const visitorService = new VisitorService()
  const { toast } = useToast()
  const [details,setDetails]=useState({
    name:"",
    company:"",
    email:"",
    phone:"",
    purpose:"",
    department:"",
    host:"",
    notes:""
  })
  const [photoSource, setPhotoSource] = useState<"upload" | "camera">("upload")
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(()=>{
    const fetchHosts=async()=>{
      const hosts=await fetch("/api/getHosts")
      const hostsData=await hosts.json()
      setHosts(hostsData)
    }
    fetchHosts()
  },[])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!photoPreview){
      toast({
        title: "Photo is required",
        description: "Please take a photo of the visitor or upload an existing image.",
      })
      return
    }
    const visitorData = {
      ...details,
      status:"pending",
      photo: photoPreview
    }
    const {notes,...filteredVisitorData}=visitorData
    visitorService.visitor=filteredVisitorData as Visitor
    const {visitor,host} = await visitorService.createVisitor()
    toast({
      title: "Visitor registered successfully",
      description: "The visitor has been registered and the host has been notified.",
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take a photo.",
      })
    }
  }

  const handleCameraCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 200, 200)
        const imageData = canvasRef.current.toDataURL("image/png")
        setPhotoPreview(imageData)
        toast({
          title: "Photo captured",
          description: "Visitor photo successfully captured from camera.",
        })
      }
    }
  }

  const clearPhoto = () => {
    setPhotoPreview(null)
  }

  useEffect(() => {
    if (photoSource === "camera") {
      startCamera()
    }
  }, [photoSource])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="John Smith" required value={details.name} onChange={(e)=>setDetails({...details,name:e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input id="company" placeholder="Acme Inc." value={details.company} onChange={(e)=>setDetails({...details,company:e.target.value})} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required value={details.email} onChange={(e)=>setDetails({...details,email:e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required value={details.phone} onChange={(e)=>setDetails({...details,phone:e.target.value})} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit</Label>
                  <Select required value={details.purpose} onValueChange={(value) => setDetails({...details, purpose: value})}>
                    <SelectTrigger id="purpose">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select required value={details.department} onValueChange={(value) => setDetails({...details, department: value})}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="host">Host Employee Name</Label>
                <Select required value={details.host} onValueChange={(value) => setDetails({...details, host: value})}>
                  <SelectTrigger id="host"> 
                    <SelectValue placeholder="Select host" />
                  </SelectTrigger>
                  <SelectContent>
                  {hosts.map((host,idx) => (
        <SelectItem key={idx} value={host.name}>
          {host.name} ({host.department})
        </SelectItem>
      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any special requirements or information..." value={details.notes} onChange={(e)=>{}} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Register Visitor</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Visitor Photo</h3>
              <p className="text-sm text-muted-foreground">Take a photo of the visitor or upload an existing image</p>
            </div>

            <Tabs value={photoSource} onValueChange={(v) => setPhotoSource(v as "upload" | "camera")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Photo</TabsTrigger>
                <TabsTrigger value="camera">Take Photo</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Visitor"
                        className="h-48 w-48 rounded-full object-cover border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={clearPhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-48 w-48 items-center justify-center rounded-full border border-dashed">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Upload Picture</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={handlePhotoUpload} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="camera" className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Captured"
                        className="h-48 w-48 rounded-full object-cover border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={clearPhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        className="h-48 w-48 rounded-full object-cover border"
                        playsInline
                        autoPlay
                        muted
                      />
                      <canvas ref={canvasRef} width={200} height={200} hidden />
                    </>
                  )}
                  {!photoPreview && (
                    <Button onClick={handleCameraCapture} className="w-full">
                      <Camera className="mr-2 h-4 w-4" /> Capture Photo
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="rounded-md bg-muted p-4">
              <h4 className="mb-2 font-medium">Photo Requirements</h4>
              <ul className="space-y-2 text-sm">
                <li>• Clear, front-facing view of the visitor</li>
                <li>• Neutral background preferred</li>
                <li>• Good lighting conditions</li>
                <li>• No sunglasses or head coverings that obscure face</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
