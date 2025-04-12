import { NextRequest, NextResponse } from "next/server"
import { sendMail } from "@/utils/sendMail"
import { generateQRCode } from "@/utils/generateQRCode"
import puppeteer from "puppeteer"
import { PrismaClient } from "@/generated/prisma" 
const prisma=new PrismaClient()
interface PreApprovalData {
  visitorName: string
  company: string
  email: string
  phone: string
  date: Date
  startTime: string
  endTime: string
  purpose: string
  notes: string
  sendEmail: boolean
  department: string
  hostId: string
}

export async function POST(req: NextRequest) {
  try {
    const data: PreApprovalData = await req.json()

    const createdVisitor = await prisma.visitor.create({
        data: {
          name: data.visitorName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          purpose: data.purpose,
          department: data.department,
          status: "pre_approved",
          checkInTime: null,
          checkOutTime: null,
          host: {
            connect: { id: data.hostId }
          }
        }
      })
    const qrCodeData = {
      name: data.visitorName,
      company: data.company,
      email: data.email,
      phone: data.phone,
      purpose: data.purpose,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime
    }

    const qrcode = await generateQRCode(qrCodeData as any)

    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .card {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border-radius: 8px;
            background-color: #f9f9f9;
          }
          h2 { color: #333; }
          p { margin: 5px 0; }
          img { max-width: 200px; display: block; margin: 20px auto; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Visitor Pass</h2>
          <p><strong>Visitor Name:</strong> ${data.visitorName}</p>
          <p><strong>Company:</strong> ${data.company}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
          <p><strong>Purpose:</strong> ${data.purpose}</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
          <img src="${qrcode}" alt="QR Code" />
          <p style="margin-top: 20px; color: #666;">
            Please present this pass at the security desk when you arrive.
          </p>
        </div>
      </body>
      </html>
    `

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({ format: "A4" })
    await browser.close()

    if (data.sendEmail) {
      await sendMail({
        recipient: data.email,
        subject: "Your Visitor Pass",
        html: "Please find your visitor pass attached as a PDF.",
        text: "Please find your visitor pass attached as a PDF.",
        attachments: [
          {
            filename: "Visitor-Pass.pdf",
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      })
    }

    return NextResponse.json({ success: true, visitorId: createdVisitor.id })
  } catch (error) {
    console.error("Error generating/sending PDF:", error)
    return NextResponse.json(
      { error: "Failed to process pre-approval" },
      { status: 500 }
    )
  }
}
