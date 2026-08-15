"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarItem } from "@/components/layout/SidebarItem"
import {
  LayoutGrid,
  Users,
  PhilippinePeso,
  Heart,
  BookOpen,
  Settings,
  X,
  LogOut,
  Loader2,
  ClipboardCheck,
  FolderOpen,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { getCurrentUser } from "@/lib/auth"
import { abortAll } from "@/lib/abort-registry"
import { useDashboardStore } from "@/stores/dashboard.store"
import { useMemberFormStore } from "@/stores/memberForm.store"
import { useMembersStore } from "@/stores/members.store"
import { useFinanceStore } from "@/stores/finance.store"
import { useAttendanceStore } from "@/stores/attendance.store"
import { useFileStorageStore } from "@/stores/fileStorage.store"
import { useProcessQueueStore } from "@/stores/processQueue.store"
import { APP_API_ENDPOINTS } from "@/utils/constants"
import { ERROR_MESSAGES } from "@/utils/errors"
import { cn } from "@/lib/utils"

const ALL_ROLES = ["ADMIN", "FINANCE_ADMIN", "USER"]

const NAV_GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutGrid,
        allowedFor: ["ADMIN", "FINANCE_ADMIN"],
      },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      {
        href: "/members",
        label: "Members",
        icon: Users,
        allowedFor: ALL_ROLES,
      },
      {
        href: "/attendance",
        label: "Attendance",
        icon: ClipboardCheck,
        allowedFor: ["ADMIN", "USER"],
      },
      {
        href: "/soul-winning",
        label: "Soul Winning",
        icon: Heart,
        allowedFor: ["ADMIN"],
      },
      {
        href: "/new-believers",
        label: "New Believers",
        icon: BookOpen,
        allowedFor: ["ADMIN"],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        href: "/finances",
        label: "Finances",
        icon: PhilippinePeso,
        allowedFor: ["ADMIN", "FINANCE_ADMIN"],
      },
      {
        href: "/file-storage",
        label: "File Storage",
        icon: FolderOpen,
        allowedFor: ALL_ROLES,
      },
    ],
  },
]

const SYSTEM_ITEMS = [
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    allowedFor: ["ADMIN", "FINANCE_ADMIN"],
  },
]

function roleLabel(role) {
  if (role === "ADMIN") return "Administrator"
  if (role === "FINANCE_ADMIN") return "Finance Admin"
  if (role === "USER") return "User"
  return "Account"
}

function Sidebar({ open = false, onClose }) {
  const pathname = usePathname()
  const router = useRouter()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState("")
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)
  const [userLoaded, setUserLoaded] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setRole(currentUser?.role ?? null)
    setUser(currentUser)
    setUserLoaded(true)
  }, [])

  const displayName = user?.name || user?.email || "User"
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.allowedFor.includes(role)),
  })).filter((group) => group.items.length > 0)

  const systemItems = SYSTEM_ITEMS.filter((item) =>
    item.allowedFor.includes(role)
  )

  function goTo(href) {
    router.push(href)
    onClose?.()
  }

  async function handleLogout() {
    const unfinished = useProcessQueueStore.getState().unfinishedCount()
    if (unfinished > 0) {
      const proceed = window.confirm(
        unfinished === 1
          ? "You have 1 background process still running or failed. Logging out will cancel it. Continue?"
          : `You have ${unfinished} background processes still running or failed. Logging out will cancel them. Continue?`
      )
      if (!proceed) return
    }

    setLogoutError("")
    setIsLoggingOut(true)

    // Cancel every in-flight authenticated request first. Middleware renews
    // (re-Set-Cookies) the session cookie on every authenticated GET — a
    // request still in flight when logout clears cookies can otherwise land
    // afterward and resurrect a valid session via its stale renewed cookie.
    abortAll()
    useProcessQueueStore.getState().reset()

    try {
      const res = await fetch(APP_API_ENDPOINTS.AUTH_LOGOUT, {
        method: "POST",
      })
      const body = await res.json().catch(() => null)

      if (!res.ok || !body?.success) throw new Error()

      useDashboardStore.getState().reset()
      useMemberFormStore.getState().reset()
      useMembersStore.getState().reset()
      useFinanceStore.getState().reset()
      useAttendanceStore.getState().reset()
      useFileStorageStore.getState().reset()

      onClose?.()
      router.push("/login")
      // Keep the overlay up until navigation unmounts this page — clearing
      // isLoggingOut here would flash the UI before /login lands.
    } catch {
      setLogoutError(ERROR_MESSAGES.LOGOUT)
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {isLoggingOut && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-[#1e2a4a]/70 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-8 py-6 shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-foreground" />
            <p className="text-sm font-medium text-foreground/85">
              Signing out…
            </p>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col overflow-hidden transition-transform duration-200 ease-out md:translate-x-0",
          // Softer than flat brand navy: cooler slate depth + subtle vertical wash
          "bg-[linear-gradient(180deg,#1a2236_0%,#151c2e_55%,#121826_100%)]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="flex shrink-0 items-start gap-3 border-b border-white/10 px-5 pt-6 pb-5">
          <img
            src="/images/logo.png"
            alt="Lighthouse BBC"
            className="size-11 shrink-0 object-cover"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="font-heading text-[15px] leading-snug font-semibold tracking-wide text-white">
              Lighthouse BBC
            </p>
            <p className="mt-0.5 text-[11px] tracking-wide text-white/45 uppercase">
              Goa · Management
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
          <div className="flex flex-col gap-5">
            {role
              ? visibleGroups.map((group) => (
                  <div key={group.id} className="flex flex-col gap-1">
                    <p className="px-3 pb-1 text-[10px] font-medium tracking-[0.14em] text-white/35 uppercase">
                      {group.label}
                    </p>
                    {group.items.map((item) => (
                      <SidebarItem
                        key={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={pathname.startsWith(item.href)}
                        onClick={() => goTo(item.href)}
                      />
                    ))}
                  </div>
                ))
              : null}
          </div>
        </nav>

        {/* System + account */}
        <div className="shrink-0 border-t border-white/10 px-3 pt-3 pb-4">
          {role && systemItems.length > 0 ? (
            <div className="mb-2 flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-medium tracking-[0.14em] text-white/35 uppercase">
                System
              </p>
              {systemItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                  onClick={() => goTo(item.href)}
                />
              ))}
            </div>
          ) : null}

          <div className="mb-3 flex items-center justify-between rounded-xl bg-white/4 px-3 py-2">
            <span className="text-xs text-white/45">Appearance</span>
            <ThemeToggle className="text-white/55 hover:bg-white/10 hover:text-white" />
          </div>

          <div className="rounded-xl bg-white/6 p-2.5 ring-1 ring-white/10">
            <div className="flex items-center gap-2.5">
              {userLoaded ? (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 font-heading text-xs font-semibold text-[#1e2a4a]">
                    {initials || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-[11px] text-white/40">
                      {roleLabel(role)}
                      {user?.email && user?.name ? ` · ${user.email}` : ""}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/10" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label={isLoggingOut ? "Signing out" : "Sign out"}
                title={isLoggingOut ? "Signing out…" : "Sign out"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {logoutError ? (
            <p className="px-1 pt-2 text-xs text-red-300">{logoutError}</p>
          ) : null}
        </div>
      </aside>
    </>
  )
}

export { Sidebar }
export default Sidebar
