"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarItem } from "@/components/layout/SidebarItem"
import {
  LayoutGrid,
  Users,
  PhilippinePeso,
  Heart,
  Settings,
  X,
  LogOut,
  Loader2,
  ClipboardCheck,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { abortAll } from "@/lib/abort-registry"
import { useDashboardStore } from "@/stores/dashboard.store"
import { useMemberFormStore } from "@/stores/memberForm.store"
import { useMembersStore } from "@/stores/members.store"
import { useFinanceStore } from "@/stores/finance.store"
import { useAttendanceStore } from "@/stores/attendance.store"
import { APP_API_ENDPOINTS } from "@/utils/constants"
import { ERROR_MESSAGES } from "@/utils/errors"

const ALL_ROLES = ["ADMIN", "FINANCE_ADMIN", "USER"]

// Every sidebar link in one place. `section` decides where it renders
// (top nav list vs. bottom block); `allowedFor` is an explicit role
// allow-list so a new role defaults to hidden unless granted access.
const sidebarItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
    section: "top",
    allowedFor: ["ADMIN", "FINANCE_ADMIN"],
  },
  {
    href: "/members",
    label: "Members",
    icon: Users,
    section: "top",
    allowedFor: ALL_ROLES,
  },
  {
    href: "/attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    section: "top",
    allowedFor: ["ADMIN", "USER"],
  },
  {
    href: "/finances",
    label: "Finances",
    icon: PhilippinePeso,
    section: "top",
    allowedFor: ["ADMIN", "FINANCE_ADMIN"],
  },
  {
    href: "/soul-winning",
    label: "Soul Winning",
    icon: Heart,
    section: "top",
    allowedFor: ["ADMIN"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    section: "bottom",
    allowedFor: ["ADMIN", "FINANCE_ADMIN"],
  },
]

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

  const visibleItems = sidebarItems.filter((item) =>
    item.allowedFor.includes(role)
  )
  const topItems = visibleItems.filter((item) => item.section === "top")
  const bottomItems = visibleItems.filter((item) => item.section === "bottom")

  function goTo(href) {
    router.push(href)
    onClose?.()
  }

  async function handleLogout() {
    setLogoutError("")
    setIsLoggingOut(true)

    // Cancel every in-flight authenticated request first. Middleware renews
    // (re-Set-Cookies) the session cookie on every authenticated GET — a
    // request still in flight when logout clears cookies can otherwise land
    // afterward and resurrect a valid session via its stale renewed cookie.
    abortAll()

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
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-[#1e2a4a]" />
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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col overflow-y-auto bg-[#1e2a4a] px-4 py-6 transition-transform duration-200 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2 pb-6">
          <img
            src="/images/logo.png"
            alt="Lighthouse BBC"
            className="size-[3em] shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold leading-tight text-white">
              LIGHTHOUSE BBC GOA
            </p>
            <p className="text-xs text-white/50">Data Management System</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {role &&
            topItems.map((item) => (
              <SidebarItem
                key={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname.startsWith(item.href)}
                onClick={() => goTo(item.href)}
              />
            ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          {role &&
            bottomItems.map((item) => (
              <SidebarItem
                key={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname.startsWith(item.href)}
                onClick={() => goTo(item.href)}
              />
            ))}

          <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4">
            {userLoaded ? (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 font-heading text-sm font-semibold text-[#1e2a4a]">
                  {initials || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="text-xs text-white/50">
                    {user?.email && user?.name ? user.email : "Administrator"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10" />
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </button>
          </div>

          {logoutError && (
            <p className="px-3 pt-2 text-xs text-red-300">{logoutError}</p>
          )}
        </div>
      </aside>
    </>
  )
}

export { Sidebar }
export default Sidebar
