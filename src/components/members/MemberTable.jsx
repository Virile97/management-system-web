import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MemberRow } from "@/components/members/MemberRow"
import { MemberCard } from "@/components/members/MemberCard"
import { Pagination } from "@/components/common/Pagination"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { Users } from "lucide-react"

function MemberTable({
  members: rows,
  isLoading,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onPrintMember,
  onEditMember,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
}) {
  if (isLoading) {
    return <ListCardSkeleton rows={pageSize} className="overflow-hidden rounded-2xl p-4 sm:p-6" />
  }

  const allPageSelected = rows.length > 0 && rows.every((member) => selected.has(member.id))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + rows.length

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members found"
          description="Try adjusting your search or status filter."
          className="py-16"
        />
      ) : (
        <>
          <table className="hidden w-full border-collapse md:table">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="w-10 py-3 pl-4">
                  <Checkbox checked={allPageSelected} onCheckedChange={() => onToggleSelectAll(rows)} />
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Member
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Contact
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Group
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Baptized At
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Status
                </th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  checked={selected.has(member.id)}
                  onCheckedChange={() => onToggleSelect(member)}
                  onPrint={onPrintMember}
                  onEdit={onEditMember}
                />
              ))}
            </tbody>
          </table>

          <div className="border-b border-border bg-muted/60 px-4 py-3 md:hidden">
            <label className="flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Checkbox checked={allPageSelected} onCheckedChange={() => onToggleSelectAll(rows)} />
              Select all
            </label>
          </div>

          <div className="md:hidden">
            {rows.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                checked={selected.has(member.id)}
                onCheckedChange={() => onToggleSelect(member)}
                onPrint={onPrintMember}
                onEdit={onEditMember}
              />
            ))}
          </div>
        </>
      )}

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  )
}

export { MemberTable }
export default MemberTable
