import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request:NextRequest){
    const {token,password}=await request.json()
    const prisma=new PrismaClient()
    try{
        const res=await prisma.user.update({
            where:{resetToken:token},
            data:{password}
        })
        return NextResponse.json({message:"Password reset successful"},{status:200})
    }catch(error){
        return NextResponse.json({message:"Password reset failed"},{status:500})
    }
}
