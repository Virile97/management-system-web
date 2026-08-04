"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"

const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "#1e2a4a",
  },
}

const chartData = [
  { month: "Jan", attendance: 210 },
  { month: "Feb", attendance: 245 },
  { month: "Mar", attendance: 238 },
  { month: "Apr", attendance: 252 },
  { month: "May", attendance: 268 },
  { month: "Jun", attendance: 260 },
]

function AttendanceChart() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Attendance Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e2a4a" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1e2a4a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="transparent" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              fontSize={12}
            />
            <Area
              dataKey="attendance"
              type="monotone"
              stroke="#1e2a4a"
              strokeWidth={2}
              fill="url(#attendanceFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { AttendanceChart }
export default AttendanceChart
