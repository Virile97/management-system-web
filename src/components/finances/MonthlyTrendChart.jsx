"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { ChartCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

const chartConfig = {
  income: {
    label: "Income",
    color: "#16a34a",
  },
  expense: {
    label: "Expense",
    color: "#b3492f",
  },
}

function MonthlyTrendChart({ data = [], isLoading }) {
  if (isLoading) {
    return <ChartCardSkeleton />
  }

  const hasData = data.some((entry) => entry.income > 0 || entry.expense > 0)

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Monthly Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-end px-0">
        {!hasData ? (
          <EmptyState
            icon={TrendingUp}
            title="No trend data yet"
            description="Monthly income and expenses will show up here once transactions are recorded."
          />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b3492f" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#b3492f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="transparent" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                fontSize={12}
              />
              <Area
                dataKey="income"
                type="monotone"
                stroke="#16a34a"
                strokeOpacity={0}
                fill="#16a34a"
                fillOpacity={0}
                isAnimationActive={false}
              />
              <Area
                dataKey="expense"
                type="monotone"
                stroke="#b3492f"
                strokeWidth={2}
                fill="url(#expenseFill)"
                isAnimationActive={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name, item) => (
                      <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-xs"
                            style={{ backgroundColor: item.color ?? item.payload?.fill }}
                          />
                          <span className="text-muted-foreground">{chartConfig[name]?.label ?? name}</span>
                        </div>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          ₱{Number(value).toLocaleString()}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent className="justify-start" />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export { MonthlyTrendChart }
export default MonthlyTrendChart
