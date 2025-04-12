import { PrismaClient } from "@/generated/prisma"
import { NextRequest, NextResponse } from "next/server"
import { startOfDay, endOfDay, getHours } from "date-fns"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const hostId = url.searchParams.get("hostId")
    const dateParam = url.searchParams.get("date") 
    if (!hostId) {
      return NextResponse.json({ error: "Host ID is required" }, { status: 400 })
    }

    const selectedDate = dateParam ? new Date(dateParam) : new Date()
    const dayStart = startOfDay(selectedDate)
    const dayEnd = endOfDay(selectedDate)

    const visitors = await prisma.visitor.findMany({
      where: {
        hostId,
        createdAt: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      select: {
        createdAt: true
      }
    })

    const hourlyCount: { [hour: string]: number } = {}
    for (let hour = 8; hour <= 17; hour++) {
      const label = formatHour(hour)
      hourlyCount[label] = 0
    }

    visitors.forEach(visitor => {
      const hour = visitor.createdAt.getHours()
      if (hour >= 8 && hour <= 17) {
        const label = formatHour(hour)
        hourlyCount[label] += 1
      }
    })

    const result = Object.entries(hourlyCount).map(([hour, visitors]) => ({
      hour,
      visitors
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const standardHour = hour % 12 === 0 ? 12 : hour % 12
  return `${standardHour} ${period}`
}
