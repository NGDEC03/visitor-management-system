import { PrismaClient, User } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest):Promise<NextResponse<User[]> | NextResponse<{error:string}>>{
    const prisma=new PrismaClient()
   try{
    const hosts=await prisma.user.findMany()
    return NextResponse.json(hosts)
   }
   catch(err){
    return NextResponse.json({error:"Some Error Occured"},{status:500})
   }
}
