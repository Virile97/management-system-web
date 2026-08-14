"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

const dailyConfig = {
  soulsWon: { label: "Souls Won", color: "#1e2a4a" },
  becameActive: { label: "Became Active", color: "#2f7d4f" },
}

const monthlyConfig = {
  soulsWon: { label: "Souls Won", color: "#1e2a4a" },
  becameActive: { label: "Became Active", color: "#2f7d4f" },
}

function SoulTrendChart({
  daily = [],
  monthly = [],
  leaderboard = [],
  isLoading = false,
}) {
  const dailyRows = daily.map((entry) => ({
    label: entry.label,
    soulsWon: Number(entry.soulsWon) || 0,
    becameActive: Number(entry.becameActive) || 0,
  }))
  const monthlyRows = monthly.map((entry) => ({
    label: entry.label,
    soulsWon: Number(entry.soulsWon) || 0,
    becameActive: Number(entry.becameActive) || 0,
  }))
  const leaderboardRows = leaderboard.map((entry) => ({
    id: entry.id,
    name: entry.name,
    count: Number(entry.count) || 0,
  }))

  const dailyTotal = dailyRows.reduce(
    (sum, row) => sum + row.soulsWon + row.becameActive,
    0
  )
  const maxLeaderboard = Math.max(
    ...leaderboardRows.map((row) => row.count),
    1
  )

  if (isLoading) {
    return (
      <Card className="rounded-2xl p-8">
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-6">
      <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-3 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
              Daily — Last 7 Days
            </CardTitle>
            <p className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {dailyTotal} total
            </p>
          </div>

          <CardContent className="px-0 pt-6">
            <ChartContainer
              config={dailyConfig}
              className="aspect-auto h-44 w-full"
            >
              <BarChart
                data={dailyRows}
                margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
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
                <ChartLegend
                  content={<ChartLegendContent className="justify-start" />}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl p-3 sm:p-6">
          <CardHeader className="px-0">
            <CardTitle className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
              Monthly — Last 6 Months
            </CardTitle>
          </CardHeader>

          <CardContent className="px-0 pt-2">
            <ChartContainer
              config={monthlyConfig}
              className="aspect-auto h-44 w-full"
            >
              <LineChart
                data={monthlyRows}
                margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/60"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={12}
                  fontSize={12}
                />
                <Line
                  dataKey="soulsWon"
                  type="monotone"
                  stroke="var(--color-soulsWon)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-soulsWon)", strokeWidth: 0 }}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="becameActive"
                  type="monotone"
                  stroke="var(--color-becameActive)"
                  strokeWidth={2}
                  dot={{
                    r: 3,
                    fill: "var(--color-becameActive)",
                    strokeWidth: 0,
                  }}
                  isAnimationActive={false}
                />
                <ChartLegend
                  content={<ChartLegendContent className="justify-start" />}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl p-3 sm:p-6">
        <CardTitle className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
          Souls Won per Soul Winner
        </CardTitle>

        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4">
          {leaderboardRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No records found.
            </p>
          ) : (
            leaderboardRows.map((winner) => (
              <div
                key={winner.id || winner.name}
                className="flex items-center gap-2 sm:gap-4"
              >
                <p className="w-20 shrink-0 truncate text-xs text-foreground/80 sm:w-40 sm:text-sm">
                  {winner.name}
                </p>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="h-full rounded-md bg-[#2f7d4f]"
                    style={{
                      width: `${(winner.count / maxLeaderboard) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {winner.count}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export { SoulTrendChart }
export default SoulTrendChart
