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
      console.log('Department Visitors:', departmentVisitors) // Debug log
      const data=departmentVisitors.map((visitor)=>{
        const department = visitor.department.toLowerCase()
        const color = 
          department.includes('it') ? '#8884d8' :
          department.includes('hr') ? '#82ca9d' :
          department.includes('finance') ? '#ffc658' :
          department.includes('marketing') ? '#ff8042' :
          department.includes('operations') ? '#0088fe' :
          '#ff7300'
        
        console.log('Department:', visitor.department, 'Color:', color) // Debug log
        
        return {
          name:visitor.department,
          value:visitor.count,
          color
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

