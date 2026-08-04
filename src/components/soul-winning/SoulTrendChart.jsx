"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

const dailyConfig = {
  soulsWon: { label: "Souls Won", color: "#1e2a4a" },
  becameActive: { label: "Became Active", color: "#2f7d4f" },
}

const dailyData = [
  { day: "Wed", soulsWon: 0, becameActive: 1 },
  { day: "Thu", soulsWon: 0, becameActive: 1 },
  { day: "Fri", soulsWon: 0, becameActive: 1 },
  { day: "Sat", soulsWon: 0, becameActive: 1 },
  { day: "Sun", soulsWon: 0, becameActive: 1 },
  { day: "Mon", soulsWon: 0, becameActive: 1 },
  { day: "Tue", soulsWon: 0, becameActive: 2 },
]

const dailyTotal = dailyData.reduce((sum, d) => sum + d.soulsWon + d.becameActive, 0)

const monthlyConfig = {
  soulsWon: { label: "Souls Won", color: "#1e2a4a" },
  activeMembers: { label: "Active Members", color: "#2f7d4f" },
}

const monthlyData = [
  { month: "Mar", soulsWon: 0, activeMembers: 1 },
  { month: "Apr", soulsWon: 0, activeMembers: 1 },
  { month: "May", soulsWon: 0, activeMembers: 1 },
  { month: "Jun", soulsWon: 0, activeMembers: 1.5 },
  { month: "Jul", soulsWon: 0, activeMembers: 5 },
  { month: "Aug", soulsWon: 0, activeMembers: 2 },
]

const winnerTotals = [
  { name: "Kofi Agyeman", value: 5 },
  { name: "Emmanuel Boateng", value: 2 },
  { name: "Grace Mensah", value: 2 },
  { name: "Yaa Amponsah", value: 2 },
]

const maxWinnerValue = Math.max(...winnerTotals.map((winner) => winner.value))

function SoulTrendChart() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-heading text-lg font-normal text-foreground/80">
              Daily — Last 7 Days
            </CardTitle>
            <p className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {dailyTotal} total
            </p>
          </div>

          <CardContent className="px-0 pt-6">
            <ChartContainer config={dailyConfig} className="aspect-auto h-44 w-full">
              <BarChart data={dailyData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  fontSize={12}
                />
                <Bar
                  dataKey="becameActive"
                  fill="var(--color-becameActive)"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="soulsWon"
                  fill="var(--color-soulsWon)"
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                />
                <ChartLegend content={<ChartLegendContent className="justify-start" />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl p-4 sm:p-6">
          <CardHeader className="px-0">
            <CardTitle className="font-heading text-lg font-normal text-foreground/80">
              Monthly — Last 6 Months
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0 pt-2">
            <ChartContainer config={monthlyConfig} className="aspect-auto h-44 w-full">
              <LineChart data={monthlyData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  fontSize={12}
                />
                <Line
                  dataKey="soulsWon"
                  type="monotone"
                  stroke="var(--color-soulsWon)"
                  strokeOpacity={0}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="activeMembers"
                  type="monotone"
                  stroke="var(--color-activeMembers)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--color-activeMembers)", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <ChartLegend content={<ChartLegendContent className="justify-start" />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl p-4 sm:p-6">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Souls Won per Soul Winner — This Month
        </CardTitle>

        <div className="mt-6 flex flex-col gap-4">
          {winnerTotals.map((winner) => (
            <div key={winner.name} className="flex items-center gap-3 sm:gap-4">
              <p className="w-24 shrink-0 truncate text-sm text-foreground/80 sm:w-40">{winner.name}</p>
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className="h-full rounded-md bg-[#2f7d4f]"
                  style={{ width: `${(winner.value / maxWinnerValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export { SoulTrendChart }
export default SoulTrendChart
