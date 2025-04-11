"use client"

import { Line } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function VisitorFlowChart() {
  const data = [
    { hour: "8 AM", visitors: 3 },
    { hour: "9 AM", visitors: 7 },
    { hour: "10 AM", visitors: 5 },
    { hour: "11 AM", visitors: 8 },
    { hour: "12 PM", visitors: 4 },
    { hour: "1 PM", visitors: 6 },
    { hour: "2 PM", visitors: 9 },
    { hour: "3 PM", visitors: 7 },
    { hour: "4 PM", visitors: 5 },
    { hour: "5 PM", visitors: 3 },
  ]

  return (
    <ChartContainer
      config={{
        visitors: {
          label: "Visitors",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <Line data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }} accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={2} activeDot={{ r: 8 }} />
      </Line>
    </ChartContainer>
  )
}
