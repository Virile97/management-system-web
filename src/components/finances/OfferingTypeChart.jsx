"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { EmptyState } from "@/components/common/EmptyState"
import { ChartCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { MultiSelectDropdown } from "@/components/common/MultiSelectDropdown"
import { PieChart, Pie, Cell } from "recharts"
import { PieChart as PieChartIcon } from "lucide-react"

// Fixed palette cycled across however many offering types the backend returns.
const COLORS = ["#1e2a4a", "#2f5233", "#b3492f", "#d98e3f", "#7a4a2b", "#c9a24b", "#4a6fa5", "#8e4162"]

function OfferingTypeChart({ data = [], isLoading }) {
  const [selectedTypes, setSelectedTypes] = useState([])

  if (isLoading) {
    return <ChartCardSkeleton />
  }

  const allTypeNames = data.map((entry) => entry.offeringType)
  const visibleData = selectedTypes.length > 0
    ? data.filter((entry) => selectedTypes.includes(entry.offeringType))
    : data

  const offeringTypes = visibleData.map((entry) => ({
    name: entry.offeringType,
    value: entry.total,
    color: COLORS[allTypeNames.indexOf(entry.offeringType) % COLORS.length],
  }))

  const chartConfig = offeringTypes.reduce((config, offeringType) => {
    config[offeringType.name] = { label: offeringType.name, color: offeringType.color }
    return config
  }, {})

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          By Offering Type
        </CardTitle>

        {allTypeNames.length > 0 && (
          <CardAction>
            <MultiSelectDropdown
              label="Offering Type"
              options={allTypeNames}
              selected={selectedTypes}
              onChange={setSelectedTypes}
            />
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-center px-0">
        {offeringTypes.length === 0 ? (
          <EmptyState
            icon={PieChartIcon}
            title="No offering type data yet"
            description="Offering breakdown by type will show up here once transactions are recorded."
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
                              className="h-2.5 w-2.5 shrink-0 rounded-xs"
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
                  data={offeringTypes}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={64}
                  strokeWidth={1}
                  stroke="var(--card)"
                  isAnimationActive={false}
                >
                  {offeringTypes.map((offeringType) => (
                    <Cell key={offeringType.name} fill={offeringType.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {offeringTypes.map((offeringType) => (
                <div key={offeringType.name} className="flex items-center gap-2 text-xs text-foreground/80">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: offeringType.color }}
                  />
                  {offeringType.name}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { OfferingTypeChart }
export default OfferingTypeChart
