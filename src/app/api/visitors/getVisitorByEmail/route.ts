import { PrismaClient, Visitor } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest):Promise<NextResponse<Visitor> | NextResponse<{error:string}>>{
    const prisma=new PrismaClient()
 const url=new URL(req.url)
 const email=url.searchParams.get('visitorEmail') || ""
 try{
    const visitor=await prisma.visitor.findUnique({
        where:{
            email
        }
    })
    if(!visitor) return NextResponse.json({error:"Visitor Not Found"},{status:404})
    return NextResponse.json(visitor,{status:200})
 }
 catch(err){
    return NextResponse.json({error:"Some Error Occured"},{status:500})
 }
 
}