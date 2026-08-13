"use client"

import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { ChartCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { MultiSelectDropdown } from "@/components/common/MultiSelectDropdown"
import { ChartBar } from "lucide-react"
import { cn } from "@/lib/utils"

// Fixed palette cycled across however many offering types the backend returns.
const COLORS = [
  "#1e2a4a",
  "#2f5233",
  "#b3492f",
  "#d98e3f",
  "#7a4a2b",
  "#c9a24b",
  "#4a6fa5",
  "#8e4162",
]

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function OfferingTypeChart({ data = [], isLoading }) {
  const [selectedTypes, setSelectedTypes] = useState([])
  const [activeName, setActiveName] = useState(null)

  if (isLoading) {
    return <ChartCardSkeleton />
  }

  const allTypeNames = data.map((entry) => entry.offeringType)
  const visibleData =
    selectedTypes.length > 0
      ? data.filter((entry) => selectedTypes.includes(entry.offeringType))
      : data

  const offeringTypes = [...visibleData]
    .map((entry) => ({
      name: entry.offeringType,
      value: Number(entry.total) || 0,
      color: COLORS[allTypeNames.indexOf(entry.offeringType) % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)

  const totalValue = offeringTypes.reduce((sum, entry) => sum + entry.value, 0)
  const activeEntry =
    offeringTypes.find((entry) => entry.name === activeName) ?? null

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

      <CardContent className="flex h-full flex-col justify-center gap-5 px-0">
        {offeringTypes.length === 0 ? (
          <EmptyState
            icon={ChartBar}
            title="No offering type data yet"
            description="Offering breakdown by type will show up here once transactions are recorded."
          />
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {activeEntry ? activeEntry.name : "All types"}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {currencyFormatter.format(
                    activeEntry ? activeEntry.value : totalValue
                  )}
                </span>
              </div>

              <div
                className="flex h-8 w-full overflow-hidden rounded-lg bg-muted"
                onMouseLeave={() => setActiveName(null)}
              >
                {offeringTypes.map((offeringType) => {
                  const widthPercent =
                    totalValue > 0
                      ? (offeringType.value / totalValue) * 100
                      : 0
                  if (widthPercent <= 0) return null

                  return (
                    <button
                      key={offeringType.name}
                      type="button"
                      title={`${offeringType.name}: ${currencyFormatter.format(offeringType.value)}`}
                      className={cn(
                        "h-full min-w-1 transition-opacity",
                        activeName &&
                          activeName !== offeringType.name &&
                          "opacity-30"
                      )}
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: offeringType.color,
                      }}
                      onMouseEnter={() => setActiveName(offeringType.name)}
                      onFocus={() => setActiveName(offeringType.name)}
                      onBlur={() => setActiveName(null)}
                    />
                  )
                })}
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {offeringTypes.map((offeringType) => {
                const sharePercent =
                  totalValue > 0
                    ? Math.round((offeringType.value / totalValue) * 100)
                    : 0

                return (
                  <li
                    key={offeringType.name}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg px-2 text-xs transition-colors",
                      activeName === offeringType.name && "bg-muted"
                    )}
                    onMouseEnter={() => setActiveName(offeringType.name)}
                    onMouseLeave={() => setActiveName(null)}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-foreground/80">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: offeringType.color }}
                      />
                      <span className="truncate">{offeringType.name}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {sharePercent}%
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { OfferingTypeChart }
export default OfferingTypeChart
