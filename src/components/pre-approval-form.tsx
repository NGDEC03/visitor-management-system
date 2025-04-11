"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PreApprovalForm() {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Pre-approval created",
      description: "The visitor has been pre-approved and will receive a pass via email.",
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Schedule a Visitor</CardTitle>
          <CardDescription>Create a pre-approval for an upcoming visitor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="visitorName">Visitor Name</Label>
                  <Input id="visitorName" placeholder="John Smith" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input id="company" placeholder="Acme Inc." />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Visit Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select required>
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:00">8:00 AM</SelectItem>
                      <SelectItem value="8:30">8:30 AM</SelectItem>
                      <SelectItem value="9:00">9:00 AM</SelectItem>
                      <SelectItem value="9:30">9:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="13:30">1:30 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="14:30">2:30 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="15:30">3:30 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="16:30">4:30 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select required>
                    <SelectTrigger id="endTime">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8:30">8:30 AM</SelectItem>
                      <SelectItem value="9:00">9:00 AM</SelectItem>
                      <SelectItem value="9:30">9:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="13:30">1:30 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="14:30">2:30 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="15:30">3:30 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="16:30">4:30 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                      <SelectItem value="17:30">5:30 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit</Label>
                <Select required>
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
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any special requirements or information..." />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="sendEmail" />
                  <label
                    htmlFor="sendEmail"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send pass via email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sendSMS" />
                  <label
                    htmlFor="sendSMS"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send pass via SMS
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Generate Pre-Approval Pass</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Pre-Approval Settings</CardTitle>
          <CardDescription>Configure your pre-approval preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyApproval" defaultChecked />
                    <label
                      htmlFor="notifyApproval"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Notify me when a visitor is approved
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyArrival" defaultChecked />
                    <label
                      htmlFor="notifyArrival"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Notify me when a visitor arrives
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notifyDeparture" />
                    <label
                      htmlFor="notifyDeparture"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Notify me when a visitor departs
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Reminder Settings</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reminderDay" defaultChecked />
                    <label
                      htmlFor="reminderDay"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send reminder 1 day before visit
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="reminderHour" defaultChecked />
                    <label
                      htmlFor="reminderHour"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send reminder 1 hour before visit
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="restrictions" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Time Restrictions</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="earliestTime">Earliest Time</Label>
                      <Select defaultValue="8:00">
                        <SelectTrigger id="earliestTime">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8:00">8:00 AM</SelectItem>
                          <SelectItem value="8:30">8:30 AM</SelectItem>
                          <SelectItem value="9:00">9:00 AM</SelectItem>
                          <SelectItem value="9:30">9:30 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latestTime">Latest Time</Label>
                      <Select defaultValue="17:00">
                        <SelectTrigger id="latestTime">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="16:30">4:30 PM</SelectItem>
                          <SelectItem value="17:00">5:00 PM</SelectItem>
                          <SelectItem value="17:30">5:30 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Approval Requirements</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="requireApproval" defaultChecked />
                    <label
                      htmlFor="requireApproval"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Require manager approval for all pre-approvals
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="limitVisitors" />
                    <label
                      htmlFor="limitVisitors"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Limit to 5 visitors per day
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" className="w-full">
            Save Settings
          </Button>
        </CardFooter>
      </Card> */}
    </div>
  )
}
