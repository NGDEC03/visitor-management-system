import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, User, VisitorStatus } from "@/generated/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendMail } from "@/utils/sendMail";
import { Visitor } from "@/generated/prisma";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

interface VisitorPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  purpose: string;
  department: string;
  photo: string;
  host: string; 
  status?: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
}
export async function GET(req: NextRequest):Promise<NextResponse<Visitor[]> | NextResponse<{error:string}>> {
  try {
    const users = await prisma.visitor.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json(
      { error: "Failed to get visitors" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest):Promise<NextResponse<{visitor:Visitor,host:User} | {error:string}>> {
  try {
    const visitor: VisitorPayload = await req.json();

    if (!visitor.host) {
      return NextResponse.json({ error: "Host name is required" }, { status: 400 });
    }

    const host = await findHostByName(visitor.host);
    
    
    if (!host) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }
    
    const cloudinaryUrl=await uploadToCloudinary(visitor.photo)

    const createdVisitor = await createVisitor({...visitor,photo:cloudinaryUrl},host.id);
console.log(createVisitor);

await notifyHost(visitor,host)

 return NextResponse.json({ visitor: createdVisitor, host });
  } catch (error) {
    console.error("Error creating visitor:", error);
    return NextResponse.json({ error: "Failed to create visitor" }, { status: 500 });
  }
}

async function notifyHost(visitor: VisitorPayload, host: User):Promise<void> {
  const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
      <tr>
        <td style="padding: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align: center; padding-bottom: 30px;">
                <h1 style="color: #0066cc; margin: 0; font-size: 24px; line-height: 32px;">⚡ New Visitor Alert ⚡</h1>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e9ecef;">
            <tr>
              <td style="padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                  <tr>
                    <td width="24" style="padding-right: 10px;">👤</td>
                    <td>
                      <p style="margin: 0; color: #666666; font-size: 12px;">VISITOR NAME</p>
                      <p style="margin: 5px 0 0 0; color: #000000; font-size: 16px;">${visitor.name}</p>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                  <tr>
                    <td width="24" style="padding-right: 10px;">🏢</td>
                    <td>
                      <p style="margin: 0; color: #666666; font-size: 12px;">COMPANY</p>
                      <p style="margin: 5px 0 0 0; color: #000000; font-size: 16px;">${visitor.company}</p>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                  <tr>
                    <td width="24" style="padding-right: 10px;">🎯</td>
                    <td>
                      <p style="margin: 0; color: #666666; font-size: 12px;">PURPOSE</p>
                      <p style="margin: 5px 0 0 0; color: #000000; font-size: 16px;">${visitor.purpose}</p>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="24" style="padding-right: 10px;">🏬</td>
                    <td>
                      <p style="margin: 0; color: #666666; font-size: 12px;">DEPARTMENT</p>
                      <p style="margin: 5px 0 0 0; color: #000000; font-size: 16px;">${visitor.department}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
            <tr>
              <td style="background-color: #e8f4fe; padding: 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #0066cc; font-size: 14px;">Please review this request in your dashboard and take appropriate action.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;


  await sendMail({
    recipient: host.email,
    subject: "New Visitor Request",
    html: htmlContent,
    text: `New visitor request from ${visitor.name}. Please check your dashboard for details.`
  })
}

async function createVisitor(visitor: VisitorPayload, hostId: string):Promise<Visitor> {
  return prisma.visitor.create({
    data: {
      name: visitor.name,
      company: visitor.company,
      email: visitor.email,
      phone: visitor.phone,
      purpose: visitor.purpose,
      department: visitor.department,
    

      photo: visitor.photo,
      status: visitor.status ?? VisitorStatus.pending,
      checkInTime: visitor.checkInTime,
      checkOutTime: visitor.checkOutTime,
      host: {
        connect: {
          id: hostId
        }
      }
    }
  });
}

async function findHostByName(name: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      name
    }
  });
}
