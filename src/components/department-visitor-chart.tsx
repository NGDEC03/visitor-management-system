"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { serviceProvider } from "@/services/serviceProvider"
import { departmentVisitorProp } from "@/types/departmentVisitor"
import { Loader2 } from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function DepartmentVisitorChart() {
  const { data: session } = useSession()
  const visitorService = serviceProvider.getVisitorService()
  const [data, setData] = useState<departmentVisitorProp[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    async function fetchData() {
      if (session?.user?.id) {
        setLoading(true)
        const response = await visitorService.getDepartmentVisitors()
        const transformedData = response.map(item => ({
          name: item.department,
          count: item.count
        }))
        setData(transformedData)
        setLoading(false)
      }
    }
    fetchData()
  }, [session])
if(loading) return (
  <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%" className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
      </ResponsiveContainer>
    </div>
)
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
            onMouseEnter={(data, index) => {
              const cell = document.querySelector(`[data-cell-index="${index}"]`)
              if (cell) {
                cell.classList.add('scale-110')
              }
            }}
            onMouseLeave={(data, index) => {
              const cell = document.querySelector(`[data-cell-index="${index}"]`)
              if (cell) {
                cell.classList.remove('scale-110')
              }
            }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="transition-all duration-300 hover:scale-110"
                data-cell-index={index}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} visitors`, "Count"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              padding: "8px 12px"
            }}
            itemStyle={{
              color: "hsl(var(--foreground))"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

