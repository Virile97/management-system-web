"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"

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

const chartData = [
  { month: "Jan", income: 2900, expense: 3200 },
  { month: "Feb", income: 3100, expense: 3400 },
  { month: "Mar", income: 2950, expense: 3250 },
  { month: "Apr", income: 3450, expense: 3700 },
  { month: "May", income: 3300, expense: 3550 },
  { month: "Jun", income: 3600, expense: 3800 },
]

function MonthlyTrendChart() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Monthly Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-center px-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b3492f" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#b3492f" stopOpacity={0} />
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
            <ChartLegend content={<ChartLegendContent className="justify-start" />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { MonthlyTrendChart }
export default MonthlyTrendChart
