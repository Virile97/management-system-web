"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { CalendarCheck } from "lucide-react"

const chartConfig = {
  rate: {
    label: "Attendance Rate",
    color: "#1e2a4a",
  },
}

function AttendanceChart({ data = [] }) {
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
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-40 w-full"
          >
            <LineChart
              data={data}
              margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/60"
              />
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
