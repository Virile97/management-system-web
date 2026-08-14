"use client"

import { Card, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid } from "recharts"
import { TrendingUp } from "lucide-react"

const trendConfig = {
  professionsOfFaith: { label: "Professions of Faith", color: "#1e2a4a" },
  baptism: { label: "Baptism", color: "#2f7d4f" },
  activeRetention: { label: "Active Retention", color: "#2563eb" },
  wentInactive: { label: "Went Inactive", color: "#d97706" },
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function ChartEmpty({ message }) {
  return (
    <div className="flex h-44 items-center justify-center rounded-xl bg-muted/40 px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function metricCounts(entry = {}) {
  return {
    professionsOfFaith:
      Number(entry.professionsOfFaith ?? entry.soulsWon) || 0,
    baptism: Number(entry.baptism ?? entry.becameActive) || 0,
    activeRetention: Number(entry.activeRetention) || 0,
    wentInactive: Number(entry.wentInactive) || 0,
  }
}

/** Ensure Jan–Dec for the chart year (API should already return 12; pad if short). */
function toMonthlyRows(monthly, year) {
  const byMonth = new Map()
  for (const entry of monthly || []) {
    const month = Number(entry.month)
    if (!Number.isInteger(month) || month < 1 || month > 12) continue
    byMonth.set(month, {
      label: entry.label || MONTH_LABELS[month - 1],
      month,
      year: Number(entry.year) || year,
      ...metricCounts(entry),
    })
  }

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1
    return (
      byMonth.get(month) || {
        label,
        month,
        year,
        professionsOfFaith: 0,
        baptism: 0,
        activeRetention: 0,
        wentInactive: 0,
      }
    )
  })
}

/**
 * Daily = rolling last 7 days (API fixed window).
 * Monthly = full calendar year filtered by period tabs (API authoritative).
 */
function SoulTrendChart({
  daily = [],
  monthly = [],
  year: yearProp,
  isLoading = false,
}) {
  const year = Number(yearProp) || new Date().getFullYear()

  const dailyRows = (daily || []).map((entry) => ({
    label: entry.label,
    ...metricCounts(entry),
  }))
  const monthlyRows = toMonthlyRows(monthly, year)

  const dailyTotal = dailyRows.reduce(
    (sum, row) => sum + row.professionsOfFaith,
    0
  )
  const monthlyTotal = monthlyRows.reduce(
    (sum, row) => sum + row.professionsOfFaith,
    0
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
      <p className="text-sm text-muted-foreground">
        Daily uses the last 7 days. Monthly shows Jan–Dec {year}, filtered by
        the selected period above.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-3 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
              Daily — Last 7 Days
            </CardTitle>
            <p className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {dailyTotal} professions
            </p>
          </div>

          <CardContent className="px-0 pt-6">
            {dailyRows.length === 0 ? (
              <ChartEmpty message="No daily data yet." />
            ) : (
              <ChartContainer
                config={trendConfig}
                className="aspect-auto h-52 w-full"
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
                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(value) => String(value)}
                      />
                    }
                  />
                  <Bar
                    dataKey="professionsOfFaith"
                    fill="var(--color-professionsOfFaith)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="baptism"
                    fill="var(--color-baptism)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="activeRetention"
                    fill="var(--color-activeRetention)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="wentInactive"
                    fill="var(--color-wentInactive)"
                    radius={[3, 3, 0, 0]}
                    isAnimationActive={false}
                  />
                  <ChartLegend
                    content={<ChartLegendContent className="justify-start" />}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl p-3 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
              Monthly — {year}
            </CardTitle>
            <p className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {monthlyTotal} professions
            </p>
          </div>

          <CardContent className="px-0 pt-6">
            <ChartContainer
              config={trendConfig}
              className="aspect-auto h-52 w-full"
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
                <ChartTooltip
                  cursor={{
                    stroke: "hsl(var(--border))",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      labelFormatter={(value) => String(value)}
                    />
                  }
                />
                <Line
                  dataKey="professionsOfFaith"
                  type="monotone"
                  stroke="var(--color-professionsOfFaith)"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  dot={{
                    r: 3,
                    fill: "var(--color-professionsOfFaith)",
                    strokeWidth: 0,
                  }}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="baptism"
                  type="monotone"
                  stroke="var(--color-baptism)"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  dot={{
                    r: 3,
                    fill: "var(--color-baptism)",
                    strokeWidth: 0,
                  }}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="activeRetention"
                  type="monotone"
                  stroke="var(--color-activeRetention)"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  dot={{
                    r: 3,
                    fill: "var(--color-activeRetention)",
                    strokeWidth: 0,
                  }}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="wentInactive"
                  type="monotone"
                  stroke="var(--color-wentInactive)"
                  strokeWidth={2}
                  activeDot={{ r: 5 }}
                  dot={{
                    r: 3,
                    fill: "var(--color-wentInactive)",
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
    </div>
  )
}

export { SoulTrendChart }
export default SoulTrendChart
