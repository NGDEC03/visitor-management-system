import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { departmentVisitorProp } from "@/types/departmentVisitor";

export async function GET(request:NextRequest):Promise<NextResponse<departmentVisitorProp[]> | NextResponse<{error:string}> >{
    const prisma=new PrismaClient()
    const url=request.nextUrl
    try{
        const visitors=await prisma.visitor.groupBy({
            by:["department"],
        _count:{
                _all:true
            },
        })
       const filteredVisitors=visitors.map((visitor)=>{
        return {
            department:visitor.department,
            count:visitor._count._all
        }
       })
       console.log(filteredVisitors);
       
       return NextResponse.json(filteredVisitors)
    }catch(error){
        console.error("Error fetching department visitors:",error)
        return NextResponse.json({error:"Internal server error"},{status:500})
    }

}