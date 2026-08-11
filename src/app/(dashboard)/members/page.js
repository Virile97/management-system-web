"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MemberFilters } from "@/components/members/MemberFilters"
import { MemberSearch } from "@/components/members/MemberSearch"
import { MemberTable } from "@/components/members/MemberTable"
import { AddMemberModal } from "@/components/members/AddMemberModal"
import { EditMemberModal } from "@/components/members/EditMemberModal"
import { PrintQrModal } from "@/components/members/PrintQrModal"
import { PrintSelectedQrModal } from "@/components/members/PrintSelectedQrModal"
import { ExportMembersReportModal } from "@/components/members/ExportMembersReportModal"
import { MemberBreakdownChart } from "@/components/dashboard/MemberBreakdownChart"
import { DateRangeButton } from "@/components/common/DateRangeButton"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { useDebounce } from "@/hooks/use-debounce"
import { formatDateRangeLabel, toDateRangeStrings } from "@/utils/helpers"
import { register as registerAbortController } from "@/lib/abort-registry"
import { listMembers, getMemberBreakdown, bulkDeleteMembers } from "@/services/member.service"
import { useMembersStore } from "@/stores/members.store"
import { Plus, QrCode, Trash2, FileDown } from "lucide-react"

export default function MembersPage() {
  return (
    <Suspense fallback={null}>
      <MembersPageContent />
    </Suspense>
  )
}

const DEFAULT_STATUS = "All"
const PAGE_SIZE = 10

function queriesMatch(a, b) {
  return a.page === b.page && a.status === b.status && a.search === b.search && a.from === b.from && a.to === b.to
}

function MembersPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)
  const activeFilter = searchParams.get("status") || DEFAULT_STATUS
  const isEditParam = searchParams.get("isEdit") === "true"
  const editMemberIdParam = searchParams.get("memberId")

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { members, meta, query, setMembers, cacheMembers, getCachedMembers } = useMembersStore(
    useShallow((state) => ({
      members: state.members,
      meta: state.meta,
      query: state.query,
      setMembers: state.setMembers,
      cacheMembers: state.cacheMembers,
      getCachedMembers: state.getCachedMembers,
    }))
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Accumulates every member ever fetched (any page/filter), so a new search
  // can be answered from state first without hitting the API.
  function searchCache(query, status) {
    const needle = query.trim().toLowerCase()
    if (!needle) return null

    const matches = []
    for (const member of getCachedMembers()) {
      if (status !== DEFAULT_STATUS && member.status !== status) continue
      const haystack = `${member.name} ${member.email || ""}`.toLowerCase()
      if (haystack.includes(needle)) matches.push(member)
    }
    return matches.length > 0 ? matches : null
  }

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [printMember, setPrintMember] = useState(null)
  const [isPrintSelectedOpen, setIsPrintSelectedOpen] = useState(false)
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Filters both the table (listMembers) and the breakdown chart
  // (getMemberBreakdown) — same from/to sent to both so they stay in sync.
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [dateRange, setDateRange] = useState(null)
  const dateRangeModalRange = dateRange ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    start: null,
    end: null,
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    utc: true,
  }
  const { from: dateFrom, to: dateTo } = dateRange ? toDateRangeStrings(dateRange) : { from: "", to: "" }

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === DEFAULT_STATUS || (key === "page" && value <= 1)) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false })
  }

  function goToPage(nextPage) {
    updateParams({ page: nextPage })
  }

  function updateFilter(nextFilter) {
    updateParams({ status: nextFilter })
  }

  function updateSearch(nextSearch) {
    setSearch(nextSearch)
    goToPage(1)
  }

  function openMember(member) {
    router.push(`/members/${member.id}`)
  }

  function openEditMember(member) {
    updateParams({ isEdit: "true", memberId: member.id })
  }

  function closeEditMember() {
    updateParams({ isEdit: "", memberId: "" })
  }

  const isFirstRun = useRef(true)

  useEffect(() => {
    const currentQuery = { page, status: activeFilter, search: debouncedSearch, from: dateFrom, to: dateTo }
    const hasDateRange = Boolean(dateFrom || dateTo)

    // On mount only: if the persisted store already holds members for this
    // exact page/filter/search/range, reuse them and skip the API call entirely.
    if (isFirstRun.current) {
      isFirstRun.current = false

      if (query && members.length > 0 && queriesMatch(query, currentQuery)) {
        setIsLoading(false)
        setError("")

        return
      }
    }

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    async function loadMembers() {
      // Search-only fast path: answer from the accumulated cache when possible,
      // skipping the API call entirely. Pagination against the API is unaffected.
      // Disabled while a date range is active — the cache was accumulated
      // without any date filtering, so it can't answer a ranged query correctly.
      if (debouncedSearch && !hasDateRange) {
        const cached = searchCache(debouncedSearch, activeFilter)
        if (cached) {
          setMembers(cached, { total: cached.length, totalPages: 1 }, currentQuery)
          setIsLoading(false)
          setError("")
          return
        }
      }

      setIsLoading(true)
      setError("")
      try {
        const { data, meta: responseMeta } = await listMembers(
          {
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch,
            status: activeFilter === DEFAULT_STATUS ? "" : activeFilter,
            from: dateFrom,
            to: dateTo,
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        const resolvedMeta = responseMeta || { total: data.length, totalPages: 1 }

        // The current page can outlive its own data (e.g. deleting members
        // shrinks the total page count) — snap back to a valid page instead
        // of getting stuck on one that no longer exists.
        if (page > 1 && page > resolvedMeta.totalPages) {
          goToPage(Math.max(1, resolvedMeta.totalPages))
          return
        }

        // Only cache when unranged — ranged results are a subset that would
        // otherwise pollute the cache used by the (range-free) search fast path.
        if (!hasDateRange) cacheMembers(data)
        setMembers(data, resolvedMeta, currentQuery)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to load members")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadMembers()
    return () => {
      controller.abort()
      unregister()
    }
  }, [page, activeFilter, debouncedSearch, dateFrom, dateTo, refreshKey])

  const [breakdown, setBreakdown] = useState({ total: 0, breakdown: [] })
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(true)

  // The breakdown describes the whole member population for the selected date
  // range, so the status tabs and the search box deliberately don't narrow it —
  // filtering the table down to one status shouldn't collapse the chart to it.
  useEffect(() => {
    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    async function loadBreakdown() {
      setIsBreakdownLoading(true)
      try {
        const data = await getMemberBreakdown({ from: dateFrom, to: dateTo }, controller.signal)
        if (controller.signal.aborted) return
        setBreakdown(data)
      } catch {
        if (controller.signal.aborted) return
      } finally {
        if (!controller.signal.aborted) setIsBreakdownLoading(false)
      }
    }

    loadBreakdown()
    return () => {
      controller.abort()
      unregister()
    }
  }, [dateFrom, dateTo, refreshKey])

  const selectedMembers = members.filter((member) => selectedIds.has(member.id))

  const hasActiveFilters = activeFilter !== DEFAULT_STATUS || Boolean(search) || Boolean(dateRange)
  // Nothing to filter — no members exist at all (not just for the current
  // filter combination) — so disable the controls rather than let the user
  // open filters with no possible effect. Never disable while a filter is
  // already active, though: a filter that itself produced zero results (e.g.
  // an empty date range) must stay open/clearable, not lock itself out.
  const filtersDisabled = meta.total === 0 && !hasActiveFilters

  function toggleSelect(member) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(member.id)) {
        next.delete(member.id)
      } else {
        next.add(member.id)
      }
      return next
    })
  }

  function toggleSelectAll(pageRows) {
    setSelectedIds((prev) => {
      const allSelected = pageRows.every((member) => prev.has(member.id))
      const next = new Set(prev)
      pageRows.forEach((member) => {
        if (allSelected) {
          next.delete(member.id)
        } else {
          next.add(member.id)
        }
      })
      return next
    })
  }

  async function handleConfirmBulkDelete() {
    setDeleteError("")
    setIsDeleting(true)
    try {
      await bulkDeleteMembers(Array.from(selectedIds))
      setSelectedIds(new Set())
      setIsDeleteSelectedOpen(false)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setDeleteError(err?.message || "Unable to delete selected members")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Church Members
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {meta.total} total members registered
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {selectedIds.size > 0 && (
              <>
                <Button
                  variant="outline"
                  className="h-10 gap-2 rounded-lg px-4"
                  onClick={() => setIsPrintSelectedOpen(true)}
                >
                  <QrCode className="h-4 w-4" />
                  Print QR ({selectedIds.size})
                </Button>
                <Button
                  variant="outline"
                  className="h-10 gap-2 rounded-lg border-destructive/30 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsDeleteSelectedOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected ({selectedIds.size})
                </Button>
              </>
            )}

            <DateRangeButton
              hasRange={Boolean(dateRange)}
              label={dateRange && formatDateRangeLabel(dateRange)}
              disabled={filtersDisabled}
              onOpen={() => setIsDateRangeOpen(true)}
              onClear={() => setDateRange(null)}
              className="h-10 px-4"
            />

            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg px-4"
              onClick={() => setIsExportOpen(true)}
              disabled={meta.total === 0 && selectedIds.size === 0}
            >
              <FileDown className="h-4 w-4" />
              Export Report
            </Button>

            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <MemberBreakdownChart
            total={breakdown.total}
            breakdown={breakdown.breakdown}
            isLoading={isBreakdownLoading}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <MemberFilters active={activeFilter} onChange={updateFilter} disabled={filtersDisabled} />
          </div>
          <MemberSearch value={search} onChange={updateSearch} disabled={filtersDisabled} />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <div className="mt-6">
          <MemberTable
            members={members}
            isLoading={isLoading}
            selected={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onPrintMember={setPrintMember}
            onEditMember={openEditMember}
            onOpenMember={openMember}
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={PAGE_SIZE}
            onPageChange={goToPage}
          />
        </div>
      </div>

      <AddMemberModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onCreated={() => setRefreshKey((key) => key + 1)}
      />
      <EditMemberModal
        open={isEditParam && Boolean(editMemberIdParam)}
        onOpenChange={(open) => !open && closeEditMember()}
        memberId={editMemberIdParam}
        onUpdated={() => setRefreshKey((key) => key + 1)}
      />
      <PrintQrModal
        open={printMember !== null}
        onOpenChange={(open) => !open && setPrintMember(null)}
        member={printMember}
      />
      <PrintSelectedQrModal
        open={isPrintSelectedOpen}
        onOpenChange={setIsPrintSelectedOpen}
        members={selectedMembers}
      />
      <ExportMembersReportModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        statusFilter={activeFilter}
        search={debouncedSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
        dateRangeLabel={dateRange ? formatDateRangeLabel(dateRange) : ""}
        selectedMembers={selectedMembers}
      />

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={dateRangeModalRange}
        hasSelection={Boolean(dateRange)}
        onApply={setDateRange}
      />

      <Dialog
        open={isDeleteSelectedOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteError("")
          setIsDeleteSelectedOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} member{selectedIds.size === 1 ? "" : "s"}?</DialogTitle>
            <DialogDescription>
              This will permanently remove the selected member{selectedIds.size === 1 ? "" : "s"} from
              the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSelectedOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
