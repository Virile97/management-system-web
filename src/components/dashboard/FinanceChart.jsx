"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts"

const chartConfig = {
  income: {
    label: "Income",
    color: "#1e2a4a",
  },
  expense: {
    label: "Expense",
    color: "#c9a24b",
  },
}

const chartData = [
  { month: "Jan", income: 14500, expense: 9200 },
  { month: "Feb", income: 15200, expense: 11800 },
  { month: "Mar", income: 13800, expense: 8600 },
  { month: "Apr", income: 16900, expense: 14200 },
  { month: "May", income: 16100, expense: 13100 },
  { month: "Jun", income: 17300, expense: 15400 },
]

function FinanceChart() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Finance Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="transparent" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              fontSize={12}
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { FinanceChart }
export default FinanceChart
