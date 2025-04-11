"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface DataItem {
  name: string
  value: number
  color: string
}

const data: DataItem[] = [
  { name: "IT", value: 12, color: "#8884d8" },
  { name: "HR", value: 8, color: "#82ca9d" },
  { name: "Finance", value: 5, color: "#ffc658" },
  { name: "Marketing", value: 10, color: "#ff8042" },
  { name: "Operations", value: 7, color: "#0088fe" },
]

export function DepartmentVisitorChart() {
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
