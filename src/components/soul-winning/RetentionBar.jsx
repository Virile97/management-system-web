import { Card } from "@/components/ui/card"

const segments = [
  { label: "Active", count: 2, color: "#2f7d4f" },
  { label: "New Convert", count: 3, color: "#1e2a4a" },
  { label: "Inactive", count: 0, color: "#c9a24b" },
]

function RetentionBar() {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0)
  const activeCount = segments.find((segment) => segment.label === "Active")?.count ?? 0
  const retentionRate = total > 0 ? Math.round((activeCount / total) * 100) : 0

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2 className="font-heading text-lg font-normal text-foreground/80">
          Souls Saved vs. Active Retention
        </h2>
        <p className="text-sm font-medium text-emerald-600">
          {retentionRate}% active retention rate
        </p>
      </div>

      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
        {segments.map((segment) => (
          <div
            key={segment.label}
            style={{
              width: total > 0 ? `${(segment.count / total) * 100}%` : 0,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2 text-sm text-foreground/80">
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
