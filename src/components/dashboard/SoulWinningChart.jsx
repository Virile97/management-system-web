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
  professionsOfFaith: {
    label: "Professions of Faith",
    color: "#1e2a4a",
  },
  baptism: {
    label: "Baptism",
    color: "#2f7d4f",
  },
  activeRetention: {
    label: "Active Retention",
    color: "#2563eb",
  },
  wentInactive: {
    label: "Went Inactive",
    color: "#d97706",
  },
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

function toChartRows(monthly = [], year = new Date().getFullYear()) {
  const byMonth = new Map()
  for (const entry of monthly || []) {
    const month = Number(entry.month)
    if (!Number.isInteger(month) || month < 1 || month > 12) continue
    byMonth.set(month, {
      month: entry.label || MONTH_LABELS[month - 1],
      professionsOfFaith:
        Number(entry.professionsOfFaith ?? entry.soulsWon) || 0,
      baptism: Number(entry.baptism ?? entry.becameActive) || 0,
      activeRetention: Number(entry.activeRetention) || 0,
      wentInactive: Number(entry.wentInactive) || 0,
    })
  }

  return MONTH_LABELS.map((label, index) => {
    const month = index + 1
    return (
      byMonth.get(month) || {
        month: label,
        year,
        professionsOfFaith: 0,
        baptism: 0,
        activeRetention: 0,
        wentInactive: 0,
      }
    )
  })
}

function SoulWinningChart({ data = [], year: yearProp }) {
  const year = Number(yearProp) || new Date().getFullYear()
  const rows = toChartRows(data, year)
  const hasData = rows.some(
    (entry) =>
      entry.professionsOfFaith > 0 ||
      entry.baptism > 0 ||
      entry.activeRetention > 0 ||
      entry.wentInactive > 0
  )
  const totalThisYear = rows.reduce(
    (sum, entry) => sum + entry.professionsOfFaith,
    0
  )

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="flex-row items-center justify-between px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Soul Winning — {year}
        </CardTitle>
        {hasData && (
          <span className="text-sm font-medium text-emerald-600">
            {totalThisYear} professions
          </span>
        )}
      </CardHeader>

      <CardContent className="px-0">
        {!hasData ? (
          <EmptyState
            icon={Heart}
            title="No professions recorded yet"
            description="Professions of faith will show up here once recorded."
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-44 w-full"
          >
            <BarChart
              data={rows}
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
