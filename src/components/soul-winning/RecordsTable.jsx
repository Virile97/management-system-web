import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const statusStyles = {
  "New Convert": "bg-[#1e2a4a]/10 text-[#1e2a4a]",
  "Active Member": "bg-emerald-50 text-emerald-600",
  Inactive: "bg-amber-50 text-amber-600",
}

const dotStyles = {
  "New Convert": "bg-[#1e2a4a]",
  "Active Member": "bg-emerald-500",
  Inactive: "bg-amber-500",
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function RecordsTable({ records }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="py-3 pl-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Date
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Convert
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Contact
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Soul Winner
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-border last:border-0">
              <td className="py-4 pl-4 align-top">
                <p className="text-sm font-medium text-foreground/85">{record.relativeDate}</p>
                <p className="text-xs text-muted-foreground">{record.date}</p>
              </td>
              <td className="py-4 pr-4 align-top">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
                    {initials(record.convert)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/85">{record.convert}</p>
                    <p className="text-xs text-muted-foreground">{record.location}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 align-top text-sm text-foreground/80">{record.contact}</td>
              <td className="py-4 pr-4 align-top">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-semibold text-[#1e2a4a]">
                    {initials(record.soulWinner)}
                  </div>
                  <span className="text-sm text-foreground/80">{record.soulWinner}</span>
                </div>
              </td>
              <td className="py-4 pr-4 align-top">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    statusStyles[record.status]
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[record.status])} />
                  {record.status}
                </span>
              </td>
              <td className="py-4 pr-4 align-top text-sm text-foreground/70">
                {record.notes || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden">
        {records.map((record) => (
          <div key={record.id} className="flex flex-col gap-3 border-b border-border p-4 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
                  {initials(record.convert)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/85">{record.convert}</p>
                  <p className="truncate text-xs text-muted-foreground">{record.location}</p>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  statusStyles[record.status]
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[record.status])} />
                {record.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-13 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-foreground/80">{record.relativeDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="text-foreground/80">{record.contact}</p>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-semibold text-[#1e2a4a]">
                  {initials(record.soulWinner)}
                </div>
                <span className="text-xs text-muted-foreground">Soul Winner:</span>
                <span className="truncate text-foreground/80">{record.soulWinner}</span>
              </div>
              {record.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-foreground/70">{record.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {records.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No records found.
        </div>
      )}
    </Card>
  )
}

export { RecordsTable }
export default RecordsTable
