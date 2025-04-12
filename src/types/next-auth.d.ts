import NextAuth from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      department?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    department?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: UserRole
    department?: string | null
  }
} 