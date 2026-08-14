"use client"

import { Card, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { TrendingUp } from "lucide-react"

const trendConfig = {
  professionsOfFaith: { label: "Professions of Faith", color: "#1e2a4a" },
  baptism: { label: "Baptism", color: "#2f7d4f" },
  activeRetention: { label: "Active Retention", color: "#2563eb" },
  wentInactive: { label: "Went Inactive", color: "#d97706" },
}

const eventConfig = {
  professionsOfFaith: { label: "Professions of Faith", color: "#1e2a4a" },
  baptism: { label: "Baptism", color: "#2f7d4f" },
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

function toEventRows(byEvent = []) {
  return (byEvent || []).map((entry) => ({
    event: entry.event || "Unspecified",
    ...metricCounts(entry),
  }))
}

/**
 * Monthly year series + event performance report (unique: which occasions
 * produced POF / baptisms in the selected period).
 */
function SoulTrendChart({
  monthly = [],
  byEvent = [],
  year: yearProp,
  isLoading = false,
}) {
  const year = Number(yearProp) || new Date().getFullYear()
  const monthlyRows = toMonthlyRows(monthly, year)
  const eventRows = toEventRows(byEvent)
  const monthlyTotal = monthlyRows.reduce(
    (sum, row) => sum + row.professionsOfFaith,
    0
  )
  const eventTotal = eventRows.reduce(
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
    <div className="flex flex-col gap-3 sm:gap-4">
      <p className="text-sm text-muted-foreground">
        Monthly is Jan–Dec {year}. Event report uses the selected period above.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="font-heading text-base font-normal text-foreground/80">
              Monthly — {year}
            </CardTitle>
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 sm:text-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              {monthlyTotal} professions
            </p>
          </div>

          <CardContent className="px-0 pt-4">
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
                  tickMargin={10}
                  fontSize={11}
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
                  activeDot={{ r: 4 }}
                  dot={{
                    r: 2.5,
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
                  activeDot={{ r: 4 }}
                  dot={{
                    r: 2.5,
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
                  activeDot={{ r: 4 }}
                  dot={{
                    r: 2.5,
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
                  activeDot={{ r: 4 }}
                  dot={{
                    r: 2.5,
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

        <Card className="rounded-2xl p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="font-heading text-base font-normal text-foreground/80">
                By Event
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Top occasions in this period
              </p>
            </div>
            <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 sm:text-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              {eventTotal} professions
            </p>
          </div>

          <CardContent className="px-0 pt-4">
            {eventRows.length === 0 ? (
              <div className="flex h-52 items-center justify-center rounded-xl bg-muted/40 px-4 text-center text-sm text-muted-foreground">
                No event data for this period.
              </div>
            ) : (
              <ChartContainer
                config={eventConfig}
                className="aspect-auto h-52 w-full"
              >
                <BarChart
                  layout="vertical"
                  data={eventRows.slice(0, 6)}
                  margin={{ left: 4, right: 8, top: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border/60"
                  />
                  <XAxis type="number" allowDecimals={false} fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="event"
                    width={88}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
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
                    radius={[0, 3, 3, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="baptism"
                    fill="var(--color-baptism)"
                    radius={[0, 3, 3, 0]}
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
      </div>
    </div>
  )
}

export { SoulTrendChart }
export default SoulTrendChart
