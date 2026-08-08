"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { ChartCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { PieChart, Pie, Cell } from "recharts"
import { PieChart as PieChartIcon } from "lucide-react"

// Fixed palette cycled across however many categories the backend returns.
const COLORS = ["#1e2a4a", "#2f5233", "#b3492f", "#d98e3f", "#7a4a2b", "#c9a24b", "#4a6fa5", "#8e4162"]

function CategoryChart({ data = [], isLoading }) {
  if (isLoading) {
    return <ChartCardSkeleton />
  }

  const categories = data.map((entry, index) => ({
    name: entry.category,
    value: entry.total,
    color: COLORS[index % COLORS.length],
  }))

  const chartConfig = categories.reduce((config, category) => {
    config[category.name] = { label: category.name, color: category.color }
    return config
  }, {})

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          By Category
        </CardTitle>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-center px-0">
        {categories.length === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title="No category data yet"
            description="Spending and income by category will show up here once transactions are recorded."
          />
        ) : (
          <>
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-36">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value, name, item) => (
                        <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: item.payload?.color }}
                            />
                            <span className="text-muted-foreground">{name}</span>
                          </div>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            ₱{Number(value).toLocaleString()}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={64}
                  strokeWidth={1}
                  stroke="var(--card)"
                  isAnimationActive={false}
                >
                  {categories.map((category) => (
                    <Cell key={category.name} fill={category.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { CategoryChart }
export default CategoryChart
