import { sendMail } from "@/utils/sendMail"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { PrismaClient } from "@/generated/prisma"
const prisma=new PrismaClient()
export async function POST(request: NextRequest): Promise<NextResponse<{message:string}  >> {
  const { email } = await request.json()
const token=crypto.randomBytes(32).toString("hex")
  const html = `
    <div style="font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 30px; background: #0d1117; color: #f0f6fc; border-radius: 12px; box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://i.ibb.co/7yz8tY8/lock-icon.png" alt="Secure Lock" width="60" style="margin-bottom: 10px;" />
    <h2 style="margin: 0; font-size: 24px; color: #58a6ff;">🔐 Reset Your Password</h2>
  </div>

  <p style="font-size: 15px; line-height: 1.6;">Hi there 👋,</p>
  <p style="font-size: 15px; line-height: 1.6;">
    You recently requested to reset your password. Click the button below to continue the process securely.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="http://localhost:3000/auth/reset-password?token=${token}"
       style="background-color: #238636; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s ease;">
      🔁 Reset Password
    </a>
  </div>

  <p style="font-size: 14px; color: #8b949e;">
    If you didn’t request this, no worries — you can safely ignore this email.
    The link will expire in <strong>30 minutes</strong> to keep your account safe.
  </p>

  <hr style="border-color: #30363d; margin: 40px 0;" />

  <p style="font-size: 12px; text-align: center; color: #8b949e;">
    Need help? Contact us anytime at 
    <a href="mailto:#" style="color: #58a6ff;">Mail Us</a><br />
    🚀 Powered by <strong>CoolTech</strong>
  </p>
</div>

  `
if(!email){
  return NextResponse.json({ message: "Email is required" }, { status: 400 })
}
  try{
    const user=await prisma.user.findUnique({
      where:{email}
    })
    if(!user){
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    const res = await sendMail({
        recipient: email,
        subject: "Forgot Password",
        text: "You have requested to reset your password. Click the link below:\n\nhttps://localhost:3000/auth/reset-password",
        html,
      })
      const response=await saveToken(email,token)
    
      return NextResponse.json({ message: "Email sent successfully" }, { status: 200 })
  }
  catch(error){
    console.log(error)
    return NextResponse.json({ message: "Email not sent" }, { status: 500 })
  }
}
async function saveToken(email:string,token:string){

    const res=await prisma.user.update({
        where:{email},
        data:{resetToken:token}
    })
    return res
}

