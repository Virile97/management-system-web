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
import { PrintSlipModal } from "@/components/members/PrintSlipModal"
import { PrintSelectedSlipsModal } from "@/components/members/PrintSelectedSlipsModal"
import { useDebounce } from "@/hooks/useDebounce"
import { listMembers, bulkDeleteMembers } from "@/services/member.service"
import { useMembersStore } from "@/stores/members.store"
import { Plus, Printer, Trash2 } from "lucide-react"

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
  return a.page === b.page && a.status === b.status && a.search === b.search
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
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [printMember, setPrintMember] = useState(null)
  const [isPrintSelectedOpen, setIsPrintSelectedOpen] = useState(false)
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

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

  function openEditMember(member) {
    updateParams({ isEdit: "true", memberId: member.id })
  }

  function closeEditMember() {
    updateParams({ isEdit: "", memberId: "" })
  }

  const isFirstRun = useRef(true)

  useEffect(() => {
    const currentQuery = { page, status: activeFilter, search: debouncedSearch }

    // On mount only: if the persisted store already holds members for this
    // exact page/filter/search, reuse them and skip the API call entirely.
    if (isFirstRun.current) {
      isFirstRun.current = false

      if (query && members.length > 0 && queriesMatch(query, currentQuery)) {
        setIsLoading(false)
        setError("")

        return
      }
    }

    const controller = new AbortController()

    async function loadMembers() {
      // Search-only fast path: answer from the accumulated cache when possible,
      // skipping the API call entirely. Pagination against the API is unaffected.
      if (debouncedSearch) {
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
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        cacheMembers(data)
        setMembers(data, responseMeta || { total: data.length, totalPages: 1 }, currentQuery)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to load members")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadMembers()
    return () => controller.abort()
  }, [page, activeFilter, debouncedSearch, refreshKey])

  const selectedMembers = members.filter((member) => selectedIds.has(member.id))

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
                  <Printer className="h-4 w-4" />
                  Print Selected ({selectedIds.size})
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

            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <MemberFilters active={activeFilter} onChange={updateFilter} />
          <MemberSearch value={search} onChange={updateSearch} />
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
      <PrintSlipModal
        open={printMember !== null}
        onOpenChange={(open) => !open && setPrintMember(null)}
        member={printMember}
      />
      <PrintSelectedSlipsModal
        open={isPrintSelectedOpen}
        onOpenChange={setIsPrintSelectedOpen}
        members={selectedMembers}
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
