"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { serviceProvider } from "@/services/serviceProvider"

export interface visitorFlowDataProp {
  hour: string
  visitors: number
}

export function VisitorFlowChart() {
  const { data: session } = useSession()
  const visitorService = serviceProvider.getVisitorService()
  const [flowData, setFlowData] = useState<visitorFlowDataProp[]>([])

  useEffect(() => {
    async function fetchFlowData() {
      if (session?.user?.id) {
        const response = await visitorService.getFlowData(session.user.id)
        console.log("API Response:", response)
        setFlowData(response)
      }
    }
    fetchFlowData()
  }, [session])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={flowData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="visitors" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
