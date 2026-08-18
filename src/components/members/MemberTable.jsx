"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { MemberRow } from "@/components/members/MemberRow"
import { MemberCard } from "@/components/members/MemberCard"
import { DataTableShell } from "@/components/common/DataTableShell"
import { SortableTh } from "@/components/common/SortableTh"
import { useTableSort } from "@/hooks/use-table-sort"
import { Users } from "lucide-react"

const SORT_COLUMNS = {
  name: { get: (row) => row.name, type: "string" },
  contact: { get: (row) => row.phone || row.contact, type: "string" },
  group: { get: (row) => row.group, type: "string" },
  baptizedAt: { get: (row) => row.baptizedAt, type: "date" },
  status: { get: (row) => row.status, type: "string" },
}

function MemberTable({
  members: rows,
  isLoading,
  selected,
  deletingIds,
  onToggleSelect,
  onToggleSelectAll,
  onPrintMember,
  onEditMember,
  onOpenMember,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}) {
  const { sortedRows, sortKey, sortDirection, toggleSort } = useTableSort(
    rows,
    SORT_COLUMNS,
    { initialKey: "name", initialDirection: "asc" }
  )

  return (
    <DataTableShell
      rows={sortedRows}
      isLoading={isLoading}
      emptyIcon={Users}
      emptyTitle="No members found"
      emptyDescription="Try adjusting your search or status filter."
      enableSelection
      selected={selected}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      renderTableHead={(selection) => (
        <tr className="border-b border-border bg-muted/40">
          <th className="w-10 py-3 pl-4">
            <Checkbox
              checked={selection.allSelected}
              onCheckedChange={selection.onToggleAll}
            />
          </th>
          <SortableTh
            label="Member"
            sortKey="name"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
          />
          <SortableTh
            label="Contact"
            sortKey="contact"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
          />
          <SortableTh
            label="Group"
            sortKey="group"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
          />
          <SortableTh
            label="Baptism Date"
            sortKey="baptizedAt"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
          />
          <SortableTh
            label="Status"
            sortKey="status"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
          />
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
            isDeleting={deletingIds?.has(member.id)}
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
            isDeleting={deletingIds?.has(member.id)}
          />
        ))
      }
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  )
}

export { MemberTable }
export default MemberTable
