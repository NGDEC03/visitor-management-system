import { PrismaClient } from "@/generated/prisma";
import { User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import bcrypt from 'bcryptjs';
import { userAgent } from "next/server";
import { UserRole } from "@/generated/prisma";

const prisma = new PrismaClient();

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            id:"user-login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          throw new Error("User not found")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department
        }
      }
    })
  ],

      secret: process.env.SECRET || "default",
      callbacks: {
    async jwt({ token, user }:{token: any, user: any}) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.department = user.department
      }
      return token
    },
    async session({ session, token }:{session: any, token: any}) {
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.department = token.department as string | null
      }
      return session
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };