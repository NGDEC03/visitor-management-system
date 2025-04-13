"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { serviceProvider } from "@/services/serviceProvider"
import { departmentVisitorProp } from "@/types/departmentVisitor"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function DepartmentVisitorChart() {
  const { data: session } = useSession()
  const visitorService = serviceProvider.getVisitorService()
  const [data, setData] = useState<departmentVisitorProp[]>([])

  useEffect(() => {
    async function fetchData() {
      if (session?.user?.id) {
        const response = await visitorService.getDepartmentVisitors(session.user.id)
        setData(response)
      }
    }
    fetchData()
  }, [session])

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
            dataKey="count"
            label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

