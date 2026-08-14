import { Card } from "@/components/ui/card"
import { Pagination } from "@/components/common/Pagination"
import { Heart } from "lucide-react"

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function SoulWinnerCard({ winner }) {
  const name = winner.name || "—"

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-[10px] font-semibold text-white">
          {initials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground/90">
            {name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-muted/50 px-3 py-2.5">
          <p className="font-heading text-lg font-normal text-foreground/85">
            {Number(winner.soulsShared) || 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Souls won</p>
        </div>
        <div className="rounded-xl bg-emerald-50/80 px-3 py-2.5">
          <p className="font-heading text-lg font-normal text-emerald-700">
            {Number(winner.nowActive) || 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Became member</p>
        </div>
        <div className="rounded-xl bg-sky-50/80 px-3 py-2.5">
          <p className="font-heading text-lg font-normal text-sky-800">
            {Number(winner.newConverts) || 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Recent POF</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-3 py-2.5">
          <p className="font-heading text-lg font-normal text-foreground/70">
            {Number(winner.needFollowUp) || 0}
          </p>
          <p className="text-[11px] text-muted-foreground">Need follow-up</p>
        </div>
      </div>
    </div>
  )
}

function Leaderboard({
  soulWinners = [],
  totalSoulsShared = 0,
  isLoading = false,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}) {
  const people = soulWinners
  const shared = Number(totalSoulsShared) || 0
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
            <Heart className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-heading text-base font-normal text-foreground/85 sm:text-lg">
              Soul Winners
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {shared > 0
                ? `${shared} soul${shared === 1 ? "" : "s"} won in this period · ${total} winner${total === 1 ? "" : "s"}`
                : "Members who recorded souls won in this period"}
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="rounded-2xl p-8">
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        </Card>
      ) : people.length === 0 ? (
        <Card className="rounded-2xl p-8">
          <p className="text-center text-sm text-muted-foreground">
            No records found.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl p-0">
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
            {people.map((winner) => (
              <SoulWinnerCard key={winner.id || winner.name} winner={winner} />
            ))}
          </div>

          {total > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              from={from}
              to={to}
              total={total}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          ) : null}
        </Card>
      )}
    </div>
  )
}

export { Leaderboard }
export default Leaderboard
