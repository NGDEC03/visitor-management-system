"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
export function PreApprovalForm() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    visitorName: "",
    company: "",
    email: "",
    phone: "",
    date: new Date(),
    startTime: "",
    endTime: "",
    purpose: "",
    notes: "",
    sendEmail: true,
    sendSMS: false,
    department: session?.user?.department,
    hostId: session?.user?.id

  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      console.log(session.user);
      
      console.log(formData)
      const response = await fetch("/api/pre-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error("Failed to submit")

      toast({
        title: "Pre-approval created",
        description: "Visitor pass sent to your email successfully."
      })

      setFormData((prev) => ({
        ...prev,
        visitorName: "",
        company: "",
        email: "",
        phone: "",
        date: new Date(),
        startTime: "",
        endTime: "",
        purpose: "",
        notes: "",
        sendEmail: true,
        sendSMS: false,
        department: session?.user?.department,
        hostId: session?.user?.id
      }))
    } catch (err) {
      toast({
        title: "Submission failed",
        description: "There was an error while sending data.",
       
      })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schedule a Visitor</CardTitle>
          <CardDescription>
            Create a pre-approval for an upcoming visitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="visitorName">Visitor Name</Label>
                <Input
                  id="visitorName"
                  value={formData.visitorName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("startTime", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {["8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"].map(
                      (time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select
                  onValueChange={(val) => handleSelectChange("endTime", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {["8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"].map(
                      (time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Select
                onValueChange={(val) => handleSelectChange("purpose", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {["meeting", "interview", "maintenance", "delivery", "other"].map(
                    (item) => (
                      <SelectItem key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Generate Pre-Approval Pass</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
