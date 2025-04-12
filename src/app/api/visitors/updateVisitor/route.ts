import { Visitor,PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req:NextRequest):Promise<NextResponse<Visitor | {error:string} |null>>{
    const prisma=new PrismaClient()
    const {visitorId,status}=await req.json()
    console.log(visitorId,status);
    try{ 
        console.log(visitorId,status);
        
        let updatedVisitor:Visitor | null=null
        enum VisitorStatus{
            rejected="rejected",
            pending="pending",
            approved="approved",
            checked_in="checked_in",
            checked_out="checked_out"
        }
        console.log("status",status);
        
        switch (status) {
            case VisitorStatus.rejected:
            case VisitorStatus.pending:
            case VisitorStatus.approved:
              console.log("case: approve/reject/pending")
          
              updatedVisitor = await prisma.visitor.update({
                where: {
                  id: visitorId,
                },
                data: {
                  status: status,
                },
              })
              break
          
            case VisitorStatus.checked_in:
              updatedVisitor = await prisma.visitor.update({
                where: {
                  id: visitorId,
                },
                data: {
                  status: status,
                  checkInTime: new Date(),
                },
              })
              break
          
            case VisitorStatus.checked_out:
              updatedVisitor = await prisma.visitor.delete({
                where: {
                  id: visitorId,
                },
              })
              break
                 }
return NextResponse.json(updatedVisitor,{status:200})
    }
    catch(err){
        return NextResponse.json({error:"Some Error Occured"},{status:500})
    }
}