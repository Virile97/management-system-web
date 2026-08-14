"use client"

import { useState } from "react"

function SegmentBar({ isLoading, empty, segments, legendSegments, summaryLabel }) {
  const [hovered, setHovered] = useState(null)
  const legend = legendSegments || segments

  return (
    <div>
      <div
        className="relative mt-3 sm:mt-4"
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted sm:h-3.5">
          {isLoading || empty ? (
            <div className="h-full w-full bg-muted" />
          ) : (
            segments.map((segment) => (
              <div
                key={segment.label}
                role="img"
                aria-label={`${segment.label}: ${segment.count}`}
                className="h-full min-w-0 cursor-default transition-[width,filter] hover:brightness-110"
                style={{
                  width: `${segment.width}%`,
                  backgroundColor: segment.color,
                }}
                onMouseEnter={(event) => {
                  const parent = event.currentTarget.parentElement
                  if (!parent) return
                  const parentRect = parent.getBoundingClientRect()
                  const rect = event.currentTarget.getBoundingClientRect()
                  setHovered({
                    ...segment,
                    left: rect.left - parentRect.left + rect.width / 2,
                  })
                }}
              />
            ))
          )}
        </div>

        {hovered ? (
          <div
            className="pointer-events-none absolute bottom-[calc(100%+8px)] z-20 -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
            style={{ left: hovered.left }}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: hovered.color }}
              />
              <span className="font-medium">{hovered.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {hovered.count}
                {typeof hovered.width === "number"
                  ? ` · ${Math.round(hovered.width)}%`
                  : ""}
              </span>
            </div>
            {summaryLabel ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {summaryLabel}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-4 sm:gap-x-6">
        {legend.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center gap-2 text-xs text-foreground/80 sm:text-sm"
            title={`${segment.label}: ${isLoading ? "—" : segment.count}`}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label} ({isLoading ? "—" : segment.count})
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Overview retention bars from:
 * retention.baptism  → Souls Won / Professions vs Baptism
 * retention.active   → Baptism vs Active Retention
 */
function RetentionBar({ retention = null, isLoading = false }) {
  const baptism = retention?.baptism || null
  const activeRetention = retention?.active || null

  // --- retention.baptism ---
  const baptismTitle = baptism?.title || "Professions of Faith vs. Baptism"
  const soulsWon = Number(baptism?.soulsWon) || 0
  const awaitingBaptism = Number(baptism?.awaitingBaptism) || 0
  const baptizedFromBaptism = Number(baptism?.baptized) || 0
  const baptismPercent =
    baptism?.baptismPercent != null ? Number(baptism.baptismPercent) : 0
  const baptismDenominator =
    soulsWon > 0 ? soulsWon : awaitingBaptism + baptizedFromBaptism

  const baptismSegments = [
    {
      label: "Professions of Faith",
      count: awaitingBaptism,
      color: "#1e2a4a",
      width:
        baptismDenominator > 0
          ? (awaitingBaptism / baptismDenominator) * 100
          : 0,
    },
    {
      label: "Baptism",
      count: baptizedFromBaptism,
      color: "#2f7d4f",
      width:
        baptismDenominator > 0
          ? (baptizedFromBaptism / baptismDenominator) * 100
          : 0,
    },
  ]

  // --- retention.active ---
  // Bar = Active vs Inactive share of baptized; legend matches card title.
  const activeTitle =
    activeRetention?.title || "Baptism vs. Active Retention"
  const baptized = Number(activeRetention?.baptized) || 0
  const active = Number(activeRetention?.active) || 0
  const inactive = Number(activeRetention?.inactive) || 0
  const activeRetentionPercent =
    activeRetention?.activeRetentionPercent != null
      ? Number(activeRetention.activeRetentionPercent)
      : 0

  const activeBarSegments = [
    {
      label: "Active Retention",
      count: active,
      color: "#2f7d4f",
      width: baptized > 0 ? (active / baptized) * 100 : 0,
    },
    {
      label: "Inactive",
      count: inactive,
      color: "#c9a24b",
      width: baptized > 0 ? (inactive / baptized) * 100 : 0,
    },
  ]

  const activeLegendSegments = [
    {
      label: "Baptism",
      count: baptized,
      color: "#1e2a4a",
    },
    {
      label: "Active Retention",
      count: active,
      color: "#2f7d4f",
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
            {baptismTitle === "Souls Won vs. Baptism"
              ? "Professions of Faith vs. Baptism"
              : baptismTitle}
          </h2>
          <p className="text-xs font-medium text-emerald-600 sm:text-sm">
            {isLoading ? "—" : `${baptismPercent}% baptism`}
          </p>
        </div>
        <SegmentBar
          isLoading={isLoading}
          empty={baptismDenominator === 0}
          segments={baptismSegments}
          summaryLabel={
            isLoading
              ? null
              : `${soulsWon || baptismDenominator} total · ${baptismPercent}% baptism`
          }
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
            {activeTitle}
          </h2>
          <p className="text-xs font-medium text-emerald-600 sm:text-sm">
            {isLoading ? "—" : `${activeRetentionPercent}% active retention`}
          </p>
        </div>
        <SegmentBar
          isLoading={isLoading}
          empty={baptized === 0}
          segments={activeBarSegments}
          legendSegments={activeLegendSegments}
          summaryLabel={
            isLoading
              ? null
              : `${baptized} baptism · ${activeRetentionPercent}% active retention`
          }
        />
      </div>
    </div>
  )
}

export { RetentionBar }
export default RetentionBar
