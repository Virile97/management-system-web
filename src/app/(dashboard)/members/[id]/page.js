"use client"

import { Suspense, useEffect, useState } from "react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"
import { Lock } from "lucide-react"

import { Breadcrumb } from "@/components/common/Breadcrumb"
import { EditMemberModal } from "@/components/members/EditMemberModal"
import { FinanceAccessModal } from "@/components/members/FinanceAccessModal"
import { MemberFinancePanel } from "@/components/members/MemberFinancePanel"
import { MemberOverviewPanel } from "@/components/members/MemberOverviewPanel"
import { MemberProfileCard } from "@/components/members/MemberProfileCard"
import { mapMemberAttendances } from "@/services/attendance.service"
import { getMemberDetail, normalizeMember } from "@/services/member.service"
import { getCurrentUser } from "@/lib/auth"
import { register as registerAbortController } from "@/lib/abort-registry"
import { useMembersStore } from "@/stores/members.store"
import {
  DEFAULT_PAGE_SIZE,
  resolvePageSize,
} from "@/utils/constants"

const DEFAULT_PERIOD = "This Year"
const FINANCE_IDLE_MS = 60_000
const FINANCE_ROLES = ["ADMIN", "FINANCE_ADMIN"]

const FINANCE_ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
]

const PERIOD_ALIASES = {
  Weekly: "This Week",
  Month: "This Month",
  Monthly: "This Month",
  Year: "This Year",
  Yearly: "This Year",
}

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
    PERIOD_ALIASES[searchParams.get("period")] ||
    searchParams.get("period") ||
    DEFAULT_PERIOD

  const periodFrom =
    periodParam === "Custom" ? searchParams.get("periodFrom") || "" : ""
  const periodTo =
    periodParam === "Custom" ? searchParams.get("periodTo") || "" : ""
  const period =
    periodParam === "Custom" && !(periodFrom && periodTo)
      ? DEFAULT_PERIOD
      : periodParam

  const offeringTypeIds = (searchParams.get("offeringType") || "")
    .split(",")
    .filter(Boolean)

  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)
  const pageSize = resolvePageSize(searchParams.get("limit"))
  const attendancePage = isFinanceView ? 1 : page

  const cachedMember = useMembersStore((state) => state.cache[memberId]) ?? null

  const [role, setRole] = useState(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [member, setMember] = useState(cachedMember)
  const [error, setError] = useState("")
  const [attendance, setAttendance] = useState([])
  const [attendanceMeta, setAttendanceMeta] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true)
  const [attendanceError, setAttendanceError] = useState("")
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const canViewFinance = FINANCE_ROLES.includes(role)

  useEffect(() => {
    setRole(getCurrentUser()?.role ?? null)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    async function loadMember() {
      setError("")
      setAttendanceError("")
      setIsAttendanceLoading(true)

      try {
        const { data, meta } = await getMemberDetail(
          memberId,
          { page: attendancePage, limit: pageSize },
          controller.signal
        )

        if (controller.signal.aborted) return

        const resolvedMeta = meta || {
          page: attendancePage,
          limit: pageSize,
          total: data?.attendances?.length ?? 0,
          totalPages: 1,
        }

        if (
          !isFinanceView &&
          attendancePage > 1 &&
          attendancePage > resolvedMeta.totalPages
        ) {
          updateParams({ page: resolvedMeta.totalPages })
          return
        }

        setMember(normalizeMember(data))
        setAttendance(mapMemberAttendances(data?.attendances))
        setAttendanceMeta(resolvedMeta)
      } catch (err) {
        if (controller.signal.aborted) return

        const message = err?.message || "Unable to load member"
        setError(message)
        setAttendanceError(err?.message || "Unable to load attendance")
      } finally {
        if (!controller.signal.aborted) {
          setIsAttendanceLoading(false)
        }
      }
    }

    loadMember()

    return () => {
      controller.abort()
      unregister()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, refreshKey, attendancePage, pageSize])

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      const remove =
        value === "" ||
        value == null ||
        value === DEFAULT_PERIOD ||
        (key === "page" && value <= 1) ||
        (key === "limit" && Number(value) === DEFAULT_PAGE_SIZE)

      remove ? params.delete(key) : params.set(key, String(value))
    }

    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  function updatePageSize(nextSize) {
    updateParams({ limit: nextSize, page: 1 })
  }

  function setFinanceView(enabled) {
    updateParams({ view: enabled ? "finance" : "", page: 1 })
  }

  function updatePeriod(nextPeriod) {
    if (nextPeriod === "Custom") return

    updateParams({
      period: nextPeriod,
      periodFrom: "",
      periodTo: "",
      page: 1,
    })
  }

  function applyPeriodRange({ from, to }) {
    updateParams({
      period: "Custom",
      periodFrom: from,
      periodTo: to,
      page: 1,
    })
  }

  function updateOfferingTypes(typeIds) {
    updateParams({
      offeringType: typeIds.length ? typeIds.join(",") : "",
      page: 1,
    })
  }

  useEffect(() => {
    if (!isFinanceView) {
      setIsUnlocked(false)
    }
  }, [isFinanceView])

  useEffect(() => {
    if (isFinanceView && !isUnlocked && canViewFinance) {
      setIsAccessModalOpen(true)
    }
  }, [isFinanceView, isUnlocked, canViewFinance])

  function handleAccessModalOpenChange(open) {
    setIsAccessModalOpen(open)

    if (!open) {
      setFinanceView(false)
    }
  }

  function handleUnlocked() {
    setIsUnlocked(true)
    setIsAccessModalOpen(false)
  }

  function handleLock() {
    setFinanceView(false)
  }

  useEffect(() => {
    if (!isFinanceView || !isUnlocked) return

    function lockFinance() {
      const params = new URLSearchParams(window.location.search)
      params.delete("view")
      params.delete("page")

      const query = params.toString()

      router.push(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      })
    }

    let timeoutId = window.setTimeout(lockFinance, FINANCE_IDLE_MS)

    function resetIdleTimer() {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(lockFinance, FINANCE_IDLE_MS)
    }

    FINANCE_ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true })
    })

    return () => {
      window.clearTimeout(timeoutId)

      FINANCE_ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [isFinanceView, isUnlocked, pathname, router])

  function handleMemberUpdated() {
    setRefreshKey((key) => key + 1)
    useMembersStore.getState().reset()
  }

  const breadcrumbItems = [
    { label: "Members", href: "/members" },
    { label: member?.name || "Member" },
    ...(canViewFinance
      ? [
          { label: "Admin View" },
          {
            label: "Finance",
            icon: Lock,
            active: true,
            onClick: () => setFinanceView(true),
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3 sm:px-6 md:px-8">
        <Breadcrumb
          items={breadcrumbItems}
          className="mx-auto max-w-6xl text-sm"
        />
      </div>

      <div className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {member ? (
          <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[280px_1fr]">
            <MemberProfileCard
              member={member}
              onEdit={() => updateParams({ isEdit: "true" })}
            />

            {isFinanceView && isUnlocked && canViewFinance ? (
              <MemberFinancePanel
                memberId={memberId}
                memberName={member.name}
                period={period}
                dateFrom={periodFrom}
                dateTo={periodTo}
                offeringTypeIds={offeringTypeIds}
                page={page}
                pageSize={pageSize}
                onPeriodChange={updatePeriod}
                onApplyDateRange={applyPeriodRange}
                onOfferingTypesChange={updateOfferingTypes}
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
                onPageSizeChange={updatePageSize}
                onLock={handleLock}
              />
            ) : (
              <MemberOverviewPanel
                member={member}
                attendance={attendance}
                isAttendanceLoading={isAttendanceLoading}
                attendanceError={attendanceError}
                page={attendanceMeta.page || attendancePage}
                totalPages={attendanceMeta.totalPages || 1}
                total={attendanceMeta.total || 0}
                pageSize={attendanceMeta.limit || pageSize}
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
                onPageSizeChange={updatePageSize}
              />
            )}
          </div>
        ) : (
          !error && (
            <p className="text-sm text-muted-foreground">Loading member…</p>
          )
        )}
      </div>

      <EditMemberModal
        open={isEditParam}
        onOpenChange={(open) => !open && updateParams({ isEdit: "" })}
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
