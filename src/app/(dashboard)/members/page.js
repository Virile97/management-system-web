"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
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
import { MemberLevelFilter } from "@/components/members/MemberLevelFilter"
import { MemberTable } from "@/components/members/MemberTable"
import { AddMemberModal } from "@/components/members/AddMemberModal"
import { EditMemberModal } from "@/components/members/EditMemberModal"
import { PrintQrModal } from "@/components/members/PrintQrModal"
import { PrintSelectedQrModal } from "@/components/members/PrintSelectedQrModal"
import { ExportMembersReportModal } from "@/components/members/ExportMembersReportModal"
import { MemberStatusSummary } from "@/components/members/MemberStatusSummary"
import { DateRangeButton } from "@/components/common/DateRangeButton"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { formatDateRangeLabel, toDateRangeStrings } from "@/utils/helpers"
import { register as registerAbortController } from "@/lib/abort-registry"
import {
  listMembers,
  getMemberBreakdown,
  getMemberFormConfig,
} from "@/services/member.service"
import { useMembersStore } from "@/stores/members.store"
import { useMemberFormStore } from "@/stores/memberForm.store"
import {
  DEFAULT_PAGE_SIZE,
  resolvePageSize,
} from "@/utils/constants"
import {
  PROCESS_TYPES,
  enqueueDeleteMembers,
  selectPendingMemberDeleteIds,
  selectPendingMemberUpdateIds,
  useProcessQueueStore,
} from "@/stores/processQueue.store"
import { Plus, QrCode, Trash2, FileDown } from "lucide-react"

export default function MembersPage() {
  return (
    <Suspense fallback={null}>
      <MembersPageContent />
    </Suspense>
  )
}

const DEFAULT_STATUS = "All"

function queriesMatch(a, b) {
  return (
    a.page === b.page &&
    a.limit === b.limit &&
    a.status === b.status &&
    a.level === b.level &&
    a.search === b.search &&
    a.from === b.from &&
    a.to === b.to
  )
}

function MembersPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)
  const pageSize = resolvePageSize(searchParams.get("limit"))
  const activeFilter = searchParams.get("status") || DEFAULT_STATUS
  const activeLevel = searchParams.get("level") || ""
  const isEditParam = searchParams.get("isEdit") === "true"
  const editMemberIdParam = searchParams.get("memberId")

  const [search, setSearch] = useState("")
  const [submittedSearch, setSubmittedSearch] = useState("")

  const {
    members,
    meta,
    query,
    setMembers,
    cacheMembers,
    updateCachedMember,
    removeCachedMembers,
  } = useMembersStore(
    useShallow((state) => ({
      members: state.members,
      meta: state.meta,
      query: state.query,
      setMembers: state.setMembers,
      cacheMembers: state.cacheMembers,
      updateCachedMember: state.updateCachedMember,
      removeCachedMembers: state.removeCachedMembers,
    }))
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const formConfig = useMemberFormStore((state) => state.config)
  const setFormConfig = useMemberFormStore((state) => state.setConfig)
  const levelOptions = formConfig?.levels || []

  // Levels power the filter dropdown; reuse the Add/Edit member form's
  // cached config instead of a dedicated fetch when it's already loaded.
  useEffect(() => {
    if (useMemberFormStore.getState().config) return

    const controller = new AbortController()

    getMemberFormConfig(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setFormConfig(data)
      })
      .catch(() => {})

    return () => controller.abort()
  }, [setFormConfig])

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const lastCompleted = useProcessQueueStore((state) => state.lastCompleted)
  const pendingDeleteIds = useProcessQueueStore(
    useShallow(selectPendingMemberDeleteIds)
  )
  const pendingUpdateIds = useProcessQueueStore(
    useShallow(selectPendingMemberUpdateIds)
  )
  const deletingMemberIds = useMemo(
    () => new Set([...pendingDeleteIds, ...pendingUpdateIds]),
    [pendingDeleteIds, pendingUpdateIds]
  )
  const activeDeleteCount = pendingDeleteIds.length
  const isFirstCompleted = useRef(true)
  const prevActiveDeleteCount = useRef(0)
  const skipCreateRefresh = useRef(true)

  // Evict deleted members from the search cache as each job succeeds.
  useEffect(() => {
    if (isFirstCompleted.current) {
      isFirstCompleted.current = false
      return
    }
    if (lastCompleted?.type !== PROCESS_TYPES.MEMBERS_DELETE_MEMBER) return

    const job = useProcessQueueStore
      .getState()
      .items.find((item) => item.id === lastCompleted.id)
    const memberId = job?.payload?.id

    if (memberId) removeCachedMembers([memberId])
  }, [lastCompleted, removeCachedMembers])

  // Refresh when a queued create finishes (still one refetch per create).
  // Updates are patched into the cache directly by EditMemberModal instead
  // of refetching — see updateCachedMember.
  useEffect(() => {
    if (skipCreateRefresh.current) {
      skipCreateRefresh.current = false
      return
    }
    if (lastCompleted?.type === PROCESS_TYPES.MEMBERS_CREATE_MEMBER) {
      setRefreshKey((key) => key + 1)
    }
  }, [lastCompleted])

  useEffect(() => {
    if (prevActiveDeleteCount.current > 0 && activeDeleteCount === 0) {
      setRefreshKey((key) => key + 1)
    }
    prevActiveDeleteCount.current = activeDeleteCount
  }, [activeDeleteCount])

  // Map keeps full member objects across pages so Print QR / export can use
  // selections from pages the user is no longer viewing.
  const [selectedById, setSelectedById] = useState(() => new Map())
  const selectedIds = useMemo(
    () => new Set(selectedById.keys()),
    [selectedById]
  )
  const selectedMembers = useMemo(
    () => Array.from(selectedById.values()),
    [selectedById]
  )
  const [printMember, setPrintMember] = useState(null)
  const [isPrintSelectedOpen, setIsPrintSelectedOpen] = useState(false)
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false)

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
  const { from: dateFrom, to: dateTo } = dateRange
    ? toDateRangeStrings(dateRange)
    : { from: "", to: "" }

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (
        value === "" ||
        value == null ||
        value === DEFAULT_STATUS ||
        (key === "page" && value <= 1) ||
        (key === "limit" && Number(value) === DEFAULT_PAGE_SIZE)
      ) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }
    router.push(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    )
  }

  function goToPage(nextPage) {
    updateParams({ page: nextPage })
  }

  function updatePageSize(nextSize) {
    updateParams({ limit: nextSize, page: 1 })
  }

  function updateFilter(nextFilter) {
    updateParams({ status: nextFilter })
  }

  function updateLevel(nextLevel) {
    updateParams({ level: nextLevel })
  }

  function submitSearch(overrideValue) {
    const nextSearch = overrideValue ?? search
    if (nextSearch === submittedSearch) return
    setSubmittedSearch(nextSearch)
    goToPage(1)
  }

  function openMember(member) {
    if (deletingMemberIds.has(member.id)) return
    router.push(`/members/${member.id}`)
  }

  function openEditMember(member) {
    if (deletingMemberIds.has(member.id)) return
    updateParams({ isEdit: "true", memberId: member.id })
  }

  function closeEditMember() {
    updateParams({ isEdit: "", memberId: "" })
  }

  const isFirstRun = useRef(true)

  useEffect(() => {
    const currentQuery = {
      page,
      limit: pageSize,
      status: activeFilter,
      level: activeLevel,
      search: submittedSearch,
      from: dateFrom,
      to: dateTo,
    }
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
      setIsLoading(true)
      setError("")
      try {
        const { data, meta: responseMeta } = await listMembers(
          {
            page,
            limit: pageSize,
            search: submittedSearch,
            status: activeFilter === DEFAULT_STATUS ? "" : activeFilter,
            levelId: activeLevel,
            from: dateFrom,
            to: dateTo,
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        const resolvedMeta = responseMeta || {
          total: data.length,
          totalPages: 1,
        }

        // The current page can outlive its own data (e.g. deleting members
        // shrinks the total page count) — snap back to a valid page instead
        // of getting stuck on one that no longer exists.
        if (page > 1 && page > resolvedMeta.totalPages) {
          goToPage(Math.max(1, resolvedMeta.totalPages))
          return
        }

        // Only cache when unranged — ranged results are a subset that would
        // otherwise pollute the accumulated member cache used elsewhere (e.g.
        // Print QR / export selections across pages).
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
  }, [
    page,
    pageSize,
    activeFilter,
    activeLevel,
    submittedSearch,
    dateFrom,
    dateTo,
    refreshKey,
  ])

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
        const data = await getMemberBreakdown(
          { from: dateFrom, to: dateTo },
          controller.signal
        )
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

  const hasActiveFilters =
    activeFilter !== DEFAULT_STATUS ||
    Boolean(activeLevel) ||
    Boolean(submittedSearch) ||
    Boolean(dateRange)
  // Nothing to filter — no members exist at all (not just for the current
  // filter combination) — so disable the controls rather than let the user
  // open filters with no possible effect. Never disable while a filter is
  // already active, though: a filter that itself produced zero results (e.g.
  // an empty date range) must stay open/clearable, not lock itself out.
  const filtersDisabled = meta.total === 0 && !hasActiveFilters

  function toggleSelect(member) {
    if (deletingMemberIds.has(member.id)) return

    setSelectedById((prev) => {
      const next = new Map(prev)

      if (next.has(member.id)) {
        next.delete(member.id)
      } else {
        next.set(member.id, member)
      }
      return next
    })
  }

  function toggleSelectAll(pageRows) {
    setSelectedById((prev) => {
      const selectableRows = pageRows.filter(
        (member) => !deletingMemberIds.has(member.id)
      )
      const allSelected = selectableRows.every((member) => prev.has(member.id))
      const next = new Map(prev)
      selectableRows.forEach((member) => {
        if (allSelected) {
          next.delete(member.id)
        } else {
          next.set(member.id, member)
        }
      })
      return next
    })
  }

  function handleConfirmBulkDelete() {
    // Queue deletes so the dialog closes immediately and each member
    // is processed in the background — same pattern as Add Member.
    enqueueDeleteMembers({ members: selectedMembers })
    setSelectedById(new Map())
    setIsDeleteSelectedOpen(false)
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Members
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage church member records and profiles
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <DateRangeButton
              hasRange={Boolean(dateRange)}
              label={dateRange && formatDateRangeLabel(dateRange)}
              disabled={filtersDisabled}
              onOpen={() => setIsDateRangeOpen(true)}
              onClear={() => setDateRange(null)}
            />

            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg bg-card px-4 text-foreground hover:bg-card"
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

        {selectedIds.size > 0 && (
          <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground">
              {selectedIds.size} member{selectedIds.size === 1 ? "" : "s"}{" "}
              selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-lg bg-card"
                onClick={() => setIsPrintSelectedOpen(true)}
              >
                <QrCode className="h-3.5 w-3.5" />
                Print QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-lg bg-card text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteSelectedOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => setSelectedById(new Map())}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        <MemberStatusSummary
          total={breakdown.total}
          breakdown={breakdown.breakdown}
          isLoading={isBreakdownLoading}
        />

        <section className="space-y-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MemberFilters
                active={activeFilter}
                onChange={updateFilter}
                disabled={filtersDisabled}
              />
              <MemberLevelFilter
                value={activeLevel}
                onChange={updateLevel}
                levels={levelOptions}
                disabled={filtersDisabled}
              />
            </div>
            <MemberSearch
              value={search}
              onChange={setSearch}
              onSubmit={submitSearch}
              disabled={filtersDisabled}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <MemberTable
            members={members}
            isLoading={isLoading}
            selected={selectedIds}
            deletingIds={deletingMemberIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onPrintMember={setPrintMember}
            onEditMember={openEditMember}
            onOpenMember={openMember}
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={pageSize}
            onPageChange={goToPage}
            onPageSizeChange={updatePageSize}
          />
        </section>
      </div>

      <AddMemberModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
      />
      <EditMemberModal
        open={isEditParam && Boolean(editMemberIdParam)}
        onOpenChange={(open) => !open && closeEditMember()}
        memberId={editMemberIdParam}
        onUpdated={(updated) => updated && updateCachedMember(updated)}
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
        search={submittedSearch}
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
        onOpenChange={setIsDeleteSelectedOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.size} member
              {selectedIds.size === 1 ? "" : "s"}?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the selected member
              {selectedIds.size === 1 ? "" : "s"} from the system. Deletions
              run in the background — track progress in the process panel.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSelectedOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmBulkDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
