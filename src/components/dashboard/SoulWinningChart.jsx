"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts"
import { Heart } from "lucide-react"

const chartConfig = {
  soulsWon: {
    label: "Souls Won",
    color: "#1e2a4a",
  },
  becameActive: {
    label: "Became Active",
    color: "#2f7d4f",
  },
}

// TODO: replace with real data once a soul-winning backend endpoint exists
const chartData = [
  { month: "Jan", soulsWon: 3, becameActive: 2 },
  { month: "Feb", soulsWon: 5, becameActive: 3 },
  { month: "Mar", soulsWon: 4, becameActive: 3 },
  { month: "Apr", soulsWon: 7, becameActive: 5 },
  { month: "May", soulsWon: 6, becameActive: 4 },
  { month: "Jun", soulsWon: 9, becameActive: 6 },
]

function SoulWinningChart({ data = chartData }) {
  const hasData = data.some(
    (entry) => entry.soulsWon > 0 || entry.becameActive > 0
  )
  const totalThisYear = data.reduce((sum, entry) => sum + entry.soulsWon, 0)

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="flex-row items-center justify-between px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Soul Winning
        </CardTitle>
        {hasData && (
          <span className="text-sm font-medium text-emerald-600">
            {totalThisYear} souls this year
          </span>
        )}
      </CardHeader>

      <CardContent className="px-0">
        {!hasData ? (
          <EmptyState
            icon={Heart}
            title="No souls recorded yet"
            description="Souls won will show up here once recorded."
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-36 w-full"
          >
            <BarChart
              data={data}
              margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="transparent" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                fontSize={12}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar
                dataKey="soulsWon"
                fill="var(--color-soulsWon)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="becameActive"
                fill="var(--color-becameActive)"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export { SoulWinningChart }
export default SoulWinningChart
