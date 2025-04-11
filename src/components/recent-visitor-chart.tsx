"use client"

import { useState } from "react"
import { CheckCircle, Clock, MoreHorizontal, Search, XCircle } from "lucide-react"

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

const visitors = [
  {
    id: "1",
    name: "John Smith",
    purpose: "Meeting",
    host: "Sarah Johnson",
    department: "Marketing",
    time: "10:30 AM",
    status: "approved",
  },
  {
    id: "2",
    name: "Emily Davis",
    purpose: "Interview",
    host: "Michael Brown",
    department: "HR",
    time: "11:15 AM",
    status: "pending",
  },
  {
    id: "3",
    name: "Robert Wilson",
    purpose: "Maintenance",
    host: "David Miller",
    department: "IT",
    time: "09:45 AM",
    status: "approved",
  },
  {
    id: "4",
    name: "Jennifer Lee",
    purpose: "Delivery",
    host: "Lisa Anderson",
    department: "Operations",
    time: "02:00 PM",
    status: "rejected",
  },
  {
    id: "5",
    name: "Michael Taylor",
    purpose: "Meeting",
    host: "James Wilson",
    department: "Finance",
    time: "03:30 PM",
    status: "approved",
  },
]

export function RecentVisitorsTable() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVisitors = visitors.filter(
    (visitor) =>
      visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visitor.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search visitors..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          prefix={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm">Add Visitor</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisitors.map((visitor) => (
              <TableRow key={visitor.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={visitor.name} />
                      <AvatarFallback>
                        {visitor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {visitor.name}
                  </div>
                </TableCell>
                <TableCell>{visitor.purpose}</TableCell>
                <TableCell>{visitor.host}</TableCell>
                <TableCell>{visitor.department}</TableCell>
                <TableCell>{visitor.time}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      visitor.status === "approved"
                        ? "default"
                        : visitor.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                    className="flex w-24 justify-center items-center gap-1"
                  >
                    {visitor.status === "approved" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : visitor.status === "pending" ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    <span className="capitalize">{visitor.status}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit visitor</DropdownMenuItem>
                      <DropdownMenuItem>Print pass</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Cancel visit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
