"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { Breadcrumb } from "@/components/common/Breadcrumb"
import { MemberProfileCard } from "@/components/members/MemberProfileCard"
import { MemberOverviewPanel } from "@/components/members/MemberOverviewPanel"
import { MemberFinancePanel } from "@/components/members/MemberFinancePanel"
import { FinanceAccessModal } from "@/components/members/FinanceAccessModal"
import { EditMemberModal } from "@/components/members/EditMemberModal"
import { getMemberById, normalizeMember } from "@/services/member.service"
import { getMemberRecentAttendance } from "@/services/attendance.service"
import { getCurrentUser } from "@/lib/auth"
import { register as registerAbortController } from "@/lib/abort-registry"
import { useMembersStore } from "@/stores/members.store"
import { Lock } from "lucide-react"

const DEFAULT_PERIOD = "This Year"

// Auto-lock the unlocked finance breakdown after this much idle time so a
// stepped-away session doesn't leave offerings on screen.
const FINANCE_IDLE_MS = 60_000

const FINANCE_ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"]

// Older bookmarks used Weekly/Monthly/Yearly (and earlier Month/Year); map
// them onto the current tab labels.
const PERIOD_ALIASES = {
  Weekly: "This Week",
  Month: "This Month",
  Monthly: "This Month",
  Year: "This Year",
  Yearly: "This Year",
}

// Same allow-list the sidebar uses for /finances — the plain USER role can see
// a member but never their financial breakdown.
const FINANCE_ROLES = ["ADMIN", "FINANCE_ADMIN"]

export default function MemberDetailPage() {
  return (
    <Suspense fallback={null}>
      <MemberDetailPageContent />
    </Suspense>
  )
}

function MemberDetailPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { id: memberId } = useParams()

  const isFinanceView = searchParams.get("view") === "finance"
  const isEditParam = searchParams.get("isEdit") === "true"
  const periodParam =
    PERIOD_ALIASES[searchParams.get("period")] || searchParams.get("period") || DEFAULT_PERIOD

  // The URL (periodFrom/periodTo) is the source of truth for the custom range,
  // so the finance panel's filters survive a reload — they're only read back
  // while the Custom period is actually active.
  const periodFrom = periodParam === "Custom" ? searchParams.get("periodFrom") || "" : ""
  const periodTo = periodParam === "Custom" ? searchParams.get("periodTo") || "" : ""

  // The offerings API rejects a custom period without both bounds, so a
  // hand-typed ?period=Custom falls back to the default rather than erroring.
  const period = periodParam === "Custom" && !(periodFrom && periodTo) ? DEFAULT_PERIOD : periodParam

  // Comma-separated config ids; empty means "all types". A single legacy id
  // still parses cleanly as a one-element list.
  const offeringTypeIds = (searchParams.get("offeringType") || "").split(",").filter(Boolean)
  const offeringsPage = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)

  // The list page caches every member it has fetched, so the profile can
  // render immediately on click while the full record loads behind it.
  const cachedMember = useMembersStore((state) => state.cache[memberId]) ?? null

  const [role, setRole] = useState(null)
  const canViewFinance = FINANCE_ROLES.includes(role)

  // Deliberately component state rather than anything persisted: the code is
  // required on every entry into the finance view, including after a reload,
  // a lock, or navigating away and back.
  const [isUnlocked, setIsUnlocked] = useState(false)

  const [member, setMember] = useState(cachedMember)
  const [error, setError] = useState("")

  const [attendance, setAttendance] = useState([])
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true)
  const [attendanceError, setAttendanceError] = useState("")

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setRole(getCurrentUser()?.role ?? null)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    async function loadMember() {
      setError("")
      try {
        const data = await getMemberById(memberId, controller.signal)
        if (controller.signal.aborted) return
        setMember(normalizeMember(data))
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to load member")
      }
    }

    loadMember()
    return () => {
      controller.abort()
      unregister()
    }
  }, [memberId, refreshKey])

  useEffect(() => {
    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    async function loadAttendance() {
      setIsAttendanceLoading(true)
      setAttendanceError("")
      try {
        const data = await getMemberRecentAttendance(memberId, controller.signal)
        if (controller.signal.aborted) return
        setAttendance(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setAttendanceError(err?.message || "Unable to load attendance")
      } finally {
        if (!controller.signal.aborted) setIsAttendanceLoading(false)
      }
    }

    loadAttendance()
    return () => {
      controller.abort()
      unregister()
    }
  }, [memberId])

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === DEFAULT_PERIOD || (key === "page" && value <= 1)) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }

    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false })
  }

  function setFinanceView(enabled) {
    updateParams({ view: enabled ? "finance" : "" })
  }

  // "Custom" only becomes the active period once a range is actually applied;
  // clicking the tab just opens the picker (the panel owns that modal).
  function updatePeriod(nextPeriod) {
    if (nextPeriod === "Custom") return

    updateParams({ period: nextPeriod, periodFrom: "", periodTo: "", page: 1 })
  }

  function applyPeriodRange({ from, to }) {
    updateParams({ period: "Custom", periodFrom: from, periodTo: to, page: 1 })
  }

  function updateOfferingTypes(nextTypeIds) {
    updateParams({ offeringType: nextTypeIds.length ? nextTypeIds.join(",") : "", page: 1 })
  }

  function goToOfferingsPage(nextPage) {
    updateParams({ page: nextPage })
  }

  // Leaving the finance view is the single place the unlock is cleared, so
  // locking, dismissing the prompt, or going elsewhere all mean the code is
  // asked for again on the way back in.
  useEffect(() => {
    if (!isFinanceView) setIsUnlocked(false)
  }, [isFinanceView])

  // Asking for the code is driven by the URL rather than the click, so landing
  // on ?view=finance directly (a reload, a shared link) prompts too.
  useEffect(() => {
    if (isFinanceView && !isUnlocked && canViewFinance) setIsAccessModalOpen(true)
  }, [isFinanceView, isUnlocked, canViewFinance])

  function handleFinanceClick() {
    setFinanceView(true)
  }

  // Only reached when the user dismisses the prompt (Esc, backdrop, close
  // button) — a successful unlock closes the dialog through handleUnlocked
  // instead, so the two cases stay distinguishable.
  function handleAccessModalOpenChange(open) {
    setIsAccessModalOpen(open)

    if (!open) setFinanceView(false)
  }

  function handleUnlocked() {
    setIsUnlocked(true)
    setIsAccessModalOpen(false)
  }

  function handleLock() {
    setFinanceView(false)
  }

  // While the breakdown is unlocked, any pointer/keyboard activity resets a
  // 1-minute idle timer; when it fires we drop view=finance the same way the
  // Lock button does, so the code is required again on re-entry. The lock
  // reads window.location so a stale searchParams closure can't wipe filters
  // the user applied after unlock.
  useEffect(() => {
    if (!isFinanceView || !isUnlocked) return

    function lockFinance() {
      const params = new URLSearchParams(window.location.search)
      params.delete("view")

      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    }

    let timeoutId = window.setTimeout(lockFinance, FINANCE_IDLE_MS)

    function resetIdleTimer() {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(lockFinance, FINANCE_IDLE_MS)
    }

    for (const event of FINANCE_ACTIVITY_EVENTS) {
      window.addEventListener(event, resetIdleTimer, { passive: true })
    }

    return () => {
      window.clearTimeout(timeoutId)

      for (const event of FINANCE_ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetIdleTimer)
      }
    }
  }, [isFinanceView, isUnlocked, pathname, router])

  // Same ?isEdit=true convention the list page uses, but the modal opens over
  // this page — the member id already comes from the route.
  function openEditMember() {
    updateParams({ isEdit: "true" })
  }

  function closeEditMember() {
    updateParams({ isEdit: "" })
  }

  function handleMemberUpdated() {
    setRefreshKey((key) => key + 1)
    // The list page reuses its persisted rows on mount, which now hold a stale
    // copy of this member — drop them so it refetches when navigated back to.
    useMembersStore.getState().reset()
  }

  const breadcrumbItems = [
    { label: "Members", href: "/members" },
    { label: member?.name || "Member" },
    ...(canViewFinance
      ? [
          { label: "Admin View" },
          { label: "Finance", icon: Lock, active: true, onClick: handleFinanceClick },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white px-4 py-3 sm:px-6 md:px-8">
        <Breadcrumb items={breadcrumbItems} className="mx-auto max-w-6xl text-sm" />
      </div>

      <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        {member ? (
          <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[280px_1fr]">
            <MemberProfileCard member={member} onEdit={openEditMember} />

            {isFinanceView && isUnlocked && canViewFinance ? (
              <MemberFinancePanel
                memberId={memberId}
                memberName={member.name}
                period={period}
                dateFrom={periodFrom}
                dateTo={periodTo}
                offeringTypeIds={offeringTypeIds}
                page={offeringsPage}
                onPeriodChange={updatePeriod}
                onApplyDateRange={applyPeriodRange}
                onOfferingTypesChange={updateOfferingTypes}
                onPageChange={goToOfferingsPage}
                onLock={handleLock}
              />
            ) : (
              <MemberOverviewPanel
                member={member}
                attendance={attendance}
                isAttendanceLoading={isAttendanceLoading}
                attendanceError={attendanceError}
              />
            )}
          </div>
        ) : (
          !error && <p className="text-sm text-muted-foreground">Loading member…</p>
        )}
      </div>

      <EditMemberModal
        open={isEditParam}
        onOpenChange={(open) => !open && closeEditMember()}
        memberId={memberId}
        onUpdated={handleMemberUpdated}
      />

      <FinanceAccessModal
        open={isAccessModalOpen}
        onOpenChange={handleAccessModalOpenChange}
        onUnlocked={handleUnlocked}
      />
    </div>
  )
}
