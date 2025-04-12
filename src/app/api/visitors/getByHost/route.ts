import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, VisitorStatus } from "@/generated/prisma";
import { Visitor } from "@/generated/prisma";
import { isToday, isYesterday } from "date-fns";

export async function GET(req:NextRequest):Promise<NextResponse<{visitors:Visitor[]}> | NextResponse<{error:string}>>{
    try{
        const prisma=new PrismaClient()
        const url=new URL(req.url)
        const hostId=url.searchParams.get("hostId")
        console.log("Request URL:", req.url);
        console.log("Host ID from query:", hostId);

        if(!hostId){
            console.log("No hostId provided in query");
            return NextResponse.json({error:"Host ID is required"},{status:400})
        }

        const visitors = await prisma.visitor.findMany({
            where: {
                hostId: hostId
            }
        });

        return NextResponse.json({
            visitors:visitors
        }, {status:200});
    }
    catch(error){
        console.error("Error in total-visitor route:", error);
        return NextResponse.json({error:"Internal server error"},{status:500})
    }
}