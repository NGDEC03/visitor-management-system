import { Visitor,PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req:NextRequest):Promise<NextResponse<Visitor | {error:string} |null>>{
    const prisma=new PrismaClient()
    const {visitorId,status}=await req.json()
    console.log(visitorId,status);
    try{ 
        let updatedVisitor:Visitor | null=null
        enum VisitorStatus{
            rejected="rejected",
            pending="pending",
            approved="approved",
            checked_in="checked_in",
            checked_out="checked_out"
        }
        switch(status){
            case VisitorStatus.rejected || VisitorStatus.pending || VisitorStatus.approved:
         updatedVisitor=await prisma.visitor.update({
                    where:{
                        id:visitorId
                    },
                    data:{
                        status:status
                    }
                })
                break;
            case VisitorStatus.checked_in:
                 updatedVisitor=await prisma.visitor.update({
                    where:{
                        id:visitorId
                    },
                    data:{
                        status:status,
                        checkInTime:new Date()
                    }
        })
        break;
        case VisitorStatus.checked_out:
            updatedVisitor=await prisma.visitor.update({
                where:{
                    id:visitorId
                },
                data:{
                    status:status,
                    checkOutTime:new Date()
                }
            })
            break;
        }
return NextResponse.json(updatedVisitor,{status:400})
    }
    catch(err){
        return NextResponse.json({error:"Some Error Occured"},{status:500})
    }
}