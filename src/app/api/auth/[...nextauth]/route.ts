import { PrismaClient } from "@/generated/prisma"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in your environment variables");
}
console.log(dbUrl);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    },
  },
});

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if(!credentials){
            throw new Error("Credentials Not Found")
          }
         const {email,password}=credentials;
         if(!email || !password){
          throw new Error("Credentials MisMatch")
         }
         
          const user=await prisma.user.findUnique({
            where:{
              email:credentials.email
            }
          })
          console.log(password,user?.password);
          
if(!user){
  throw new Error("User Not Found")
}
const isPasswordValid=await bcrypt.compare(password,user.password)
if(!isPasswordValid){
  throw new Error("Invalid Credentials")
}
         return user
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }:{token: any, user: any}) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }:{session: any, token: any}) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
}

export { authOptions }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 