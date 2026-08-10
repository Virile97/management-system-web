import { Checkbox } from "@/components/ui/checkbox"
import { MemberRow } from "@/components/members/MemberRow"
import { MemberCard } from "@/components/members/MemberCard"
import { DataTableShell } from "@/components/common/DataTableShell"
import { Users } from "lucide-react"

function MemberTable({
  members: rows,
  isLoading,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onPrintMember,
  onEditMember,
  onOpenMember,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
}) {
  return (
    <DataTableShell
      rows={rows}
      isLoading={isLoading}
      emptyIcon={Users}
      emptyTitle="No members found"
      emptyDescription="Try adjusting your search or status filter."
      enableSelection
      selected={selected}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      renderTableHead={(selection) => (
        <tr className="border-b border-border bg-muted/60">
          <th className="w-10 py-3 pl-4">
            <Checkbox checked={selection.allSelected} onCheckedChange={selection.onToggleAll} />
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
      )}
      renderDesktopRows={(members, selection) =>
        members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            checked={selection.isSelected(member)}
            onCheckedChange={() => selection.toggle(member)}
            onPrint={onPrintMember}
            onEdit={onEditMember}
            onOpen={onOpenMember}
          />
        ))
      }
      renderMobileRows={(members, selection) =>
        members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            checked={selection.isSelected(member)}
            onCheckedChange={() => selection.toggle(member)}
            onPrint={onPrintMember}
            onEdit={onEditMember}
            onOpen={onOpenMember}
          />
        ))
      }
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  )
}

export { MemberTable }
export default MemberTable
