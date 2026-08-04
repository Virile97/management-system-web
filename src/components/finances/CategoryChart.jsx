"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"

const categories = [
  { name: "Tithe", value: 42, color: "#1e2a4a" },
  { name: "Offering", value: 18, color: "#2f5233" },
  { name: "Salaries", value: 10, color: "#b3492f" },
  { name: "Utilities", value: 12, color: "#d98e3f" },
  { name: "Maintenance", value: 8, color: "#7a4a2b" },
  { name: "Donation", value: 10, color: "#c9a24b" },
]

const chartConfig = categories.reduce((config, category) => {
  config[category.name.toLowerCase()] = { label: category.name, color: category.color }
  return config
}, {})

function CategoryChart() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          By Category
        </CardTitle>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-center px-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-36">
          <PieChart>
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
      </CardContent>
    </Card>
  )
}

export { CategoryChart }
export default CategoryChart
