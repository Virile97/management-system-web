import { Card } from "@/components/ui/card"

function RetentionBar({ retention = null }) {
  const segments = [
    {
      label: "Active",
      count: Number(retention?.active) || 0,
      color: "#2f7d4f",
    },
    {
      label: "New Convert",
      count: Number(retention?.newConvert) || 0,
      color: "#1e2a4a",
    },
    {
      label: "Inactive",
      count: Number(retention?.inactive) || 0,
      color: "#c9a24b",
    },
  ]

  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  const retentionRate =
    retention?.activeRetentionPercent != null
      ? Math.round(Number(retention.activeRetentionPercent))
      : total > 0
        ? Math.round((segments[0].count / total) * 100)
        : 0

  return (
    <Card className="rounded-2xl p-3 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="font-heading text-base font-normal text-foreground/80 sm:text-lg">
          Souls Won vs. Active Retention
        </h2>
        <p className="text-xs font-medium text-emerald-600 sm:text-sm">
          {retentionRate}% active retention rate
        </p>
      </div>

      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted sm:mt-4 sm:h-3">
        {total === 0 ? (
          <div className="h-full w-full bg-muted" />
        ) : (
          segments.map((segment) => (
            <div
              key={segment.label}
              style={{
                width: `${(segment.count / total) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-4 sm:gap-x-6">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center gap-2 text-xs text-foreground/80 sm:text-sm"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label} ({segment.count})
          </div>
        ))}
      </div>
    </Card>
  )
}

export { RetentionBar }
export default RetentionBar
