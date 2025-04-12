import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { Visitor } from "@/generated/prisma";

export async function GET(req:NextRequest){
    try{
        const prisma=new PrismaClient()
const url=new URL(req.url)
const hostId=url.searchParams.get("hostId")
let selectedVisitors
if(!hostId){
    selectedVisitors=await prisma.visitor.findMany()
}
else{

    selectedVisitors = await prisma.visitor.findMany({
        where: {
            hostId: hostId
        }
    });
} 

console.log(selectedVisitors);

if(!selectedVisitors){
    return NextResponse.json({error:"Visitors not found"},{status:404})
}
const obj={
    approved:0,
    checkedIn:0,
    checkedOut:0,
    pending:0,
    rejected:0
}
const filteredObject=selectedVisitors.map((visitor:Visitor)=>{
    if(visitor.status==="approved"){    
        obj.approved++
    }
    if(visitor.status==="checked_in"){
        obj.checkedIn++
    }
    if(visitor.status==="checked_out"){
        obj.checkedOut++
    }
    if(visitor.status==="pending"){
        obj.pending++
    }
    if(visitor.status==="cancelled"){
        obj.rejected++
    }
})
return NextResponse.json({status:obj},{status:200})
    }
    catch(error){
        return NextResponse.json({error:"Host not found"},{status:404})
    }


}