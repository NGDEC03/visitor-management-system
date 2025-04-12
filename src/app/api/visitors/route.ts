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
visitor.host="nikunj"

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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; margin-bottom: 20px;">New Visitor Request</h2>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0;"><strong>Visitor Name:</strong> ${visitor.name}</p>
        <p style="margin: 0 0 10px 0;"><strong>Company:</strong> ${visitor.company}</p>
        <p style="margin: 0 0 10px 0;"><strong>Purpose:</strong> ${visitor.purpose}</p>
        <p style="margin: 0 0 10px 0;"><strong>Department:</strong> ${visitor.department}</p>
      </div>
      <p style="color: #666; margin-bottom: 20px;">Please review and approve this visitor request at your earliest convenience.</p>
      <a href="localhost:3000/admin" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Dashboard</a>
    </div>
  `

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
