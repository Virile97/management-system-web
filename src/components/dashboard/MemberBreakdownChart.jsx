"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { PieChart, Pie, Cell } from "recharts"
import { Users } from "lucide-react"

const STATUS_COLORS = ["#3f6a4e", "#c9a24b", "#a3392f", "#4a5568", "#6b46c1"]

function MemberBreakdownChart({ total = 0, breakdown = [] }) {
  const chartConfig = breakdown.reduce((config, entry, index) => {
    config[entry.status] = { label: entry.status, color: STATUS_COLORS[index % STATUS_COLORS.length] }
    return config
  }, {})

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="flex-row items-center justify-between px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Member Breakdown
        </CardTitle>
        {total > 0 && <span className="text-sm text-muted-foreground">{total} total</span>}
      </CardHeader>

      <CardContent className="px-0">
        {total === 0 ? (
          <EmptyState
            icon={Users}
            title="No members yet"
            description="Member status breakdown will show up here once members are added."
          />
        ) : (
          <div className="flex items-center gap-6">
            <ChartContainer config={chartConfig} className="aspect-square size-34 shrink-0">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={breakdown}
                  dataKey="count"
                  nameKey="status"
                  innerRadius="65%"
                  outerRadius="100%"
                  strokeWidth={0}
                  isAnimationActive={false}
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="flex-1 space-y-3">
              {breakdown.map((entry, index) => (
                <li key={entry.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground/80">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length] }}
                      />
                      {entry.status}
                    </span>
                    <span className="text-muted-foreground">{entry.count}</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${entry.percentage}%`,
                        backgroundColor: STATUS_COLORS[index % STATUS_COLORS.length],
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { MemberBreakdownChart }
export default MemberBreakdownChart
