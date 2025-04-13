// Mock API base URL
const API_BASE_URL = 'https://api.vms.example.com'

// Mock API endpoints
export const API_ENDPOINTS = {
  VISITORS: `${API_BASE_URL}/visitors`,
  VISITOR_DETAILS: (id: string) => `${API_BASE_URL}/visitors/${id}`,
  CHECK_IN: (id: string) => `${API_BASE_URL}/visitors/${id}/check-in`,
  CHECK_OUT: (id: string) => `${API_BASE_URL}/visitors/${id}/check-out`,
  EXPORT_VISITORS: `${API_BASE_URL}/visitors/export`,
}

export enum VisitorStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  PRE_APPROVED = "pre_approved"

}

// Visitor Type
export interface Visitor {
  id?: string
  name: string
  company: string
  email: string
  phone: string
  purpose: string
  department: string
  photo: string
  checkInTime?: string
  checkOutTime?: string
  status: VisitorStatus 
  host?: String
  hostId?: String
}


// Mock API service
export const api = {
  // Get all visitors
  async getVisitors(): Promise<Visitor[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: "1",
        name: "John Doe",
        company: "Acme Inc",
        email: "john@acme.com",
        phone: "+1 555-123-4567",
        purpose: "Business meeting",
        department: "Sales",
        photo: "/placeholder.svg",
        checkInTime: "2024-03-20T10:00:00Z",
        status: VisitorStatus.APPROVED,
      },
      {
        id: "2",
        name: "Jane Smith",
        company: "XYZ Corp",
        email: "jane@xyz.com",
        phone: "+1 555-987-6543",
        purpose: "Interview",
        department: "HR",
        photo: "/placeholder.svg",
        checkInTime: "2024-03-20T11:30:00Z",
        checkOutTime: "2024-03-20T12:45:00Z",
        status: VisitorStatus.APPROVED,
      },
    ]
  },

  async getVisitorDetails(id: string): Promise<Visitor> {
    const visitors = await this.getVisitors()
    const visitor = visitors.find(v => v.id === id)
    if (!visitor) {
      throw new Error("Visitor not found")
    }
    return visitor
  },

  async getVisitorPass(id: string): Promise<Visitor> {
    return this.getVisitorDetails(id)
  },

  // Create a new visitor
  async createVisitor(visitor: Omit<Visitor, "id">): Promise<Visitor> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      ...visitor,
      id: Math.random().toString(36).substring(7),
    }
  },

  // Update an existing visitor
  async updateVisitor(id: string, visitor: Visitor): Promise<Visitor> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return visitor
  },

  // Check in visitor
  async checkInVisitor(id: string): Promise<Visitor> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const visitors = await this.getVisitors()
    const visitor = visitors.find(v => v.id === id)
    if (!visitor) {
      throw new Error("Visitor not found")
    }
    return {
      ...visitor,
      checkInTime: new Date().toISOString(),
    }
  },

  // Check out visitor
  async checkOutVisitor(id: string): Promise<Visitor> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const visitors = await this.getVisitors()
    const visitor = visitors.find(v => v.id === id)
    if (!visitor) {
      throw new Error("Visitor not found")
    }
    return {
      ...visitor,
      checkOutTime: new Date().toISOString(),
    }
  },

  // Export visitors
  async exportVisitors(): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const visitors = await this.getVisitors()
    const csv = [
      ["Name", "Company", "Email", "Phone", "Purpose", "Department", "Check In", "Check Out"],
      ...visitors.map(v => [
        v.name,
        v.company,
        v.email,
        v.phone,
        v.purpose,
        v.department,
        v.checkInTime ?? "",
        v.checkOutTime ?? "",
      ]),
    ]
      .map(row => row.join(","))
      .join("\n")
    return new Blob([csv], { type: "text/csv" })
  },
  async cancelVisit(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
  },
}
