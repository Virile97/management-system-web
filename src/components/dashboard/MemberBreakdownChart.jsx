"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"

const chartConfig = {
  active: {
    label: "Active",
    color: "#3f6a4e",
  },
  inactive: {
    label: "Inactive",
    color: "#c9a24b",
  },
  deceased: {
    label: "Deceased",
    color: "#a3392f",
  },
}

const chartData = [
  { key: "active", label: "Active", value: 289 },
  { key: "inactive", label: "Inactive", value: 41 },
  { key: "deceased", label: "Deceased", value: 17 },
]

const total = chartData.reduce((sum, item) => sum + item.value, 0)

function MemberBreakdownChart() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="flex-row items-center justify-between px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Member Breakdown
        </CardTitle>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </CardHeader>

      <CardContent className="px-0">
        <div className="flex items-center gap-6">
          <ChartContainer config={chartConfig} className="aspect-square h-40 w-40 shrink-0">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="label"
                innerRadius="65%"
                outerRadius="100%"
                strokeWidth={0}
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={chartConfig[entry.key].color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <ul className="flex-1 space-y-3">
            {chartData.map((entry) => (
              <li key={entry.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground/80">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: chartConfig[entry.key].color }}
                    />
                    {entry.label}
                  </span>
                  <span className="text-muted-foreground">{entry.value}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(entry.value / total) * 100}%`,
                      backgroundColor: chartConfig[entry.key].color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export { MemberBreakdownChart }
export default MemberBreakdownChart
