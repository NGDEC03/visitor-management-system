"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { serviceProvider } from "@/services/serviceProvider"
import { Loader2 } from "lucide-react"

export interface visitorFlowDataProp {
  hour: string
  visitors: number
}

export function VisitorFlowChart() {
  const { data: session } = useSession()
  const visitorService = serviceProvider.getVisitorService()
  const [flowData, setFlowData] = useState<visitorFlowDataProp[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    async function fetchFlowData() {
      if (session?.user?.id) {
        if(session.user.role==="admin"){
          setLoading(true)
          const response = await visitorService.getFlowDataByDate()
          setFlowData(response)
          setLoading(false)
        }
        else{
          setLoading(true)
          const response = await visitorService.getFlowData(session.user.id)
          setFlowData(response)
          setLoading(false)
        }
      }
    }
    fetchFlowData()
  }, [session])

  return (
    <ResponsiveContainer width="100%" height={300} className="flex items-center justify-center">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LineChart data={flowData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="visitors" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} />
      </LineChart>}
    </ResponsiveContainer>
  )
}
