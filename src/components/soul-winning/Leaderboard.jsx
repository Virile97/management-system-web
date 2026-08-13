import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Flame, Medal } from "lucide-react"

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const medalColors = ["#c9a24b", "#9ca3af", "#b45309"]

const avatarColors = {
  Youth: "#c9a24b",
  Elders: "#1e2a4a",
  "Women's Ministry": "#1e2a4a",
  Choir: "#1e2a4a",
  Ushers: "#1e2a4a",
}

function LeaderboardRow({ winner, rank, topScore }) {
  const isTop = rank === 1
  const score = winner.saved
  const percentOfTop = topScore > 0 ? Math.round((score / topScore) * 100) : 0

  return (
    <div className="flex flex-col gap-3 border-b border-border px-3 py-4 last:border-0 sm:px-6 md:flex-row md:items-center md:gap-4">
      <div className="flex items-center gap-3 md:contents">
        <div className="flex w-6 shrink-0 items-center justify-center">
          {rank <= 3 ? (
            <div className="relative flex items-center justify-center">
              <Medal
                className="h-6 w-6"
                style={{ color: medalColors[rank - 1] }}
                fill={medalColors[rank - 1]}
              />
              <span
                className="absolute bottom-0 flex h-3 w-3 items-center justify-center rounded-full text-[8px] font-bold text-white"
                style={{ backgroundColor: medalColors[rank - 1] }}
              >
                {rank}
              </span>
            </div>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              #{rank}
            </span>
          )}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: avatarColors[winner.role] ?? "#1e2a4a" }}
        >
          {initials(winner.name)}
        </div>

        <div className="min-w-0 flex-1 md:w-56 md:shrink-0 md:flex-none">
          <p className="truncate text-sm font-semibold text-foreground/90">
            {winner.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {winner.role} · since {winner.since}
          </p>
        </div>

        {isTop && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200 md:hidden">
            <Flame className="h-3 w-3" />
            Top
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-xl bg-muted/40 px-3 py-2.5 md:flex md:flex-1 md:items-center md:gap-6 md:rounded-none md:bg-transparent md:px-0 md:py-0">
        <div className="text-center md:w-14">
          <p className="font-heading text-base font-semibold text-foreground/90 sm:text-lg">
            {winner.saved}
          </p>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Saved
          </p>
        </div>
        <div className="text-center md:w-14">
          <p className="font-heading text-base font-semibold text-emerald-600 sm:text-lg">
            {winner.active}
          </p>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Active
          </p>
        </div>
        <div className="text-center md:w-14">
          <p className="font-heading text-base font-semibold text-amber-500 sm:text-lg">
            {winner.new}
          </p>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            New
          </p>
        </div>
        <div className="text-center md:w-14">
          <p className="font-heading text-base font-semibold text-red-500 sm:text-lg">
            {winner.lost}
          </p>
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Lost
          </p>
        </div>

        <div className="col-span-4 mt-1 flex flex-col gap-1 md:col-span-1 md:mt-0 md:ml-auto md:max-w-40 md:flex-1 md:items-end">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted md:bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                isTop ? "bg-amber-400" : "bg-[#1e2a4a]"
              )}
              style={{ width: `${percentOfTop}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{percentOfTop}% of top</p>
        </div>
      </div>

      <div className="hidden w-28 shrink-0 text-right md:block">
        {isTop && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200">
            <Flame className="h-3 w-3" />
            Most Active
          </span>
        )}
      </div>
    </div>
  )
}

function Leaderboard({ soulWinners }) {
  const ranked = [...soulWinners].sort((a, b) => b.saved - a.saved)
  const topScore = ranked[0]?.saved ?? 0

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      {ranked.map((winner, index) => (
        <LeaderboardRow
          key={winner.name}
          winner={winner}
          rank={index + 1}
          topScore={topScore}
        />
      ))}

      {ranked.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No records in this period.
        </p>
      )}
    </Card>
  )
}

export { Leaderboard }
export default Leaderboard
