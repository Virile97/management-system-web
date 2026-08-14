import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from "@/components/common/Pagination"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"

// Shared shell for paginated list/table pages: Card wrapper, loading
// skeleton, empty state, and the desktop-<table>/mobile-card dual layout
// (switched via `md:` breakpoints) with a Pagination footer. Callers own
// their own columns and row rendering — this only handles the parts that
// were duplicated identically across MemberTable/TransactionTable.
//
// Row selection (checkboxes + select-all) is opt-in via `enableSelection`.
// When enabled, `renderTableHead`/`renderDesktopRows`/`renderMobileRows` are
// called with a second `selection` argument: { isSelected(row), toggle(row),
// allSelected, onToggleAll, HeaderCheckbox } — callers place the checkbox
// wherever it belongs in their own markup (a <th>/<td> for the table, inline
// in the mobile card) rather than the shell dictating column position.
function DataTableShell({
  rows,
  isLoading,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  toolbar,
  renderTableHead,
  renderDesktopRows,
  renderMobileRows,
  enableSelection = false,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  getRowId = (row) => row.id,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}) {
  const skeletonRows = Math.min(pageSize, 10)

  if (isLoading && !toolbar) {
    return (
      <ListCardSkeleton
        rows={skeletonRows}
        className="overflow-hidden rounded-2xl p-4 sm:p-6"
      />
    )
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + rows.length

  const allSelected =
    enableSelection &&
    rows.length > 0 &&
    rows.every((row) => selected.has(getRowId(row)))

  const selection = enableSelection
    ? {
        isSelected: (row) => selected.has(getRowId(row)),
        toggle: (row) => onToggleSelect(row),
        allSelected,
        onToggleAll: () => onToggleSelectAll(rows),
      }
    : null

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      {toolbar}

      {isLoading ? (
        <ListCardSkeleton
          rows={skeletonRows}
          className="border-0 p-4 shadow-none sm:p-6"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          className="py-12 sm:py-16"
        />
      ) : (
        <>
          <table className="hidden w-full border-collapse md:table">
            <thead>{renderTableHead(selection)}</thead>
            <tbody>{renderDesktopRows(rows, selection)}</tbody>
          </table>

          {enableSelection && (
            <div className="border-b border-border bg-muted/60 px-4 py-3 md:hidden">
              <label className="flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={selection.onToggleAll}
                />
                Select all
              </label>
            </div>
          )}

          <div className="md:hidden">{renderMobileRows(rows, selection)}</div>
        </>
      )}

      {total > 0 && (
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
      )}
    </Card>
  )
}

export { DataTableShell }
export default DataTableShell
