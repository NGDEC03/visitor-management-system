"use client"

import { VisitorService } from "@/services/visitorService"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface DataItem {
  name: string
  value: number
  color: string
}


export function DepartmentVisitorChart() {
  const {data:session}=useSession()
const [data,setData]=useState<DataItem[]>([])
  useEffect(()=>{
    async function modifyData(){
      const visitorService=new VisitorService()
      const departmentVisitors=await visitorService.getDepartmentVisitors(session?.user?.id as string)
      const data=departmentVisitors.map((visitor)=>{
        return {
          name:visitor.department,
          value:visitor.count,
          color:visitor.department==="IT"?"#8884d8":visitor.department==="HR"?"#82ca9d":visitor.department==="Finance"?"#ffc658":visitor.department==="Marketing"?"#ff8042":visitor.department==="Operations"?"#0088fe":"#0088fe"
        }
      })
      setData(data)
    }
    modifyData()
  },[session?.user?.id])
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} visitors`, "Count"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
