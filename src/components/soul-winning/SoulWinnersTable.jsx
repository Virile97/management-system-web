import { Card } from "@/components/ui/card"

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function SoulWinnersTable({ soulWinners }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="py-3 pl-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Full Name
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Email
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Contact Number
            </th>
          </tr>
        </thead>
        <tbody>
          {soulWinners.map((winner) => (
            <tr
              key={winner.name}
              className="border-b border-border last:border-0"
            >
              <td className="py-4 pl-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
                    {initials(winner.name)}
                  </div>
                  <p className="text-sm font-medium text-foreground/85">
                    {winner.name}
                  </p>
                </div>
              </td>
              <td className="py-4 pr-4 text-sm text-foreground/80">
                {winner.email}
              </td>
              <td className="py-4 pr-4 text-sm text-foreground/80">
                {winner.phone}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {soulWinners.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No soul winners found.
        </div>
      )}
    </Card>
  )
}

export { SoulWinnersTable }
export default SoulWinnersTable
