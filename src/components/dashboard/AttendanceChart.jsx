"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { CalendarCheck } from "lucide-react"

const chartConfig = {
  rate: {
    label: "Attendance Rate",
    color: "#1e2a4a",
  },
}

// TODO: replace with real data once an /attendance trend endpoint exists —
// see src/services/attendance.service.js, which only exposes a single
// snapshot (today's stats + member list) today, not a historical series.
// Attendance is recorded per date (see the Member Attendance page), so each
// point is one recorded session date's attendance rate.
const chartData = [
  { date: "Jul 6", rate: 94 },
  { date: "Jul 13", rate: 91 },
  { date: "Jul 20", rate: 96 },
  { date: "Jul 27", rate: 89 },
  { date: "Aug 3", rate: 93 },
]

function AttendanceChart({ data = chartData }) {
  const hasData = data.some((entry) => entry.rate > 0)

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Member Attendance
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {!hasData ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance recorded yet"
            description="Attendance rate by date will show up here once members are checked in."
          />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
            <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                fontSize={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                fontSize={12}
                width={36}
                domain={["dataMin - 3", "dataMax + 3"]}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {value}% attendance
                      </span>
                    )}
                  />
                }
              />
              <Line
                dataKey="rate"
                type="monotone"
                stroke="var(--color-rate)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--color-rate)", strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export { AttendanceChart }
export default AttendanceChart
