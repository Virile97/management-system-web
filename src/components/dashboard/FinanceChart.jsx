"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts"
import { DollarSign } from "lucide-react"

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

function FinanceChart({ data = [] }) {
  const hasData = data.some((entry) => entry.income > 0 || entry.expense > 0)

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Finance Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {!hasData ? (
          <EmptyState
            icon={DollarSign}
            title="No finance activity yet"
            description="Income and expenses will show up here once transactions are recorded."
          />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
            <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="transparent" />
              <XAxis
                dataKey="label"
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
        )}
      </CardContent>
    </Card>
  )
}

export { FinanceChart }
export default FinanceChart
