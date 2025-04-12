import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { Visitor } from "@/generated/prisma";
import { isToday, isYesterday } from "date-fns";

export async function GET(req:NextRequest):Promise<NextResponse<{totalVisitorsToday:number,totalVisitorsYesterday:number}> | NextResponse<{error:string}>>{
    try{
        const prisma=new PrismaClient()
        const url=new URL(req.url)
        const hostId=url.searchParams.get("hostId")
        console.log("Request URL:", req.url);
        console.log("Host ID from query:", hostId);
let visitors
        if(!hostId){
            visitors=await prisma.visitor.findMany()
        }

      else {

          visitors=await prisma.visitor.findMany({
                where: {
                    hostId: hostId
                }
            });
      }

        console.log("Found visitors:", visitors);
        const visitorsToday = visitors.filter((visitor:Visitor) => {
            return isToday(visitor.createdAt)
        });

        const visitorsYesterday = visitors.filter((visitor:Visitor) => {
            return isYesterday(visitor.createdAt)
        });

        return NextResponse.json({
            totalVisitorsToday: visitorsToday.length,
            totalVisitorsYesterday: visitorsYesterday.length
        }, {status:200});
    }
    catch(error){
        console.error("Error in total-visitor route:", error);
        return NextResponse.json({error:"Internal server error"},{status:500})
    }
}