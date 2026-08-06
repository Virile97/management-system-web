"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarItem } from "@/components/layout/SidebarItem"
import { LayoutGrid, Users, DollarSign, Heart, Settings, Building2, X, LogOut } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { useDashboardStore } from "@/stores/dashboard.store"
import { useMemberFormStore } from "@/stores/memberForm.store"
import { useMembersStore } from "@/stores/members.store"
import { APP_API_ENDPOINTS } from "@/utils/constants"

const ALL_ROLES = ["ADMIN", "FINANCE_ADMIN", "USER"]

// Every sidebar link in one place. `section` decides where it renders
// (top nav list vs. bottom block); `allowedFor` is an explicit role
// allow-list so a new role defaults to hidden unless granted access.
const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, section: "top", allowedFor: ["ADMIN", "FINANCE_ADMIN"] },
  { href: "/members", label: "Members", icon: Users, section: "top", allowedFor: ALL_ROLES },
  { href: "/finances", label: "Finances", icon: DollarSign, section: "top", allowedFor: ["ADMIN", "FINANCE_ADMIN"] },
  { href: "/soul-winning", label: "Soul Winning", icon: Heart, section: "top", allowedFor: ["ADMIN", "FINANCE_ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, section: "bottom", allowedFor: ["ADMIN", "FINANCE_ADMIN"] },
]

function Sidebar({ open = false, onClose }) {
  const pathname = usePathname()
  const router = useRouter()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState("")
  const [role, setRole] = useState(null)

  useEffect(() => {
    setRole(getCurrentUser()?.role ?? null)
  }, [])

  const visibleItems = sidebarItems.filter((item) => item.allowedFor.includes(role))
  const topItems = visibleItems.filter((item) => item.section === "top")
  const bottomItems = visibleItems.filter((item) => item.section === "bottom")

  function goTo(href) {
    router.push(href)
    onClose?.()
  }

  async function handleLogout() {
    setLogoutError("")
    setIsLoggingOut(true)

    try {
      const res = await fetch(APP_API_ENDPOINTS.AUTH_LOGOUT, { method: "POST" })
      const body = await res.json().catch(() => null)
  
      if (!res.ok || !body?.success) throw new Error()

      useDashboardStore.getState().reset()
      useMemberFormStore.getState().reset()
      useMembersStore.getState().reset()

      onClose?.()
      router.push("/login")
    } catch {
      setLogoutError("Something went wrong while signing out. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400">
            <Building2 className="h-5 w-5 text-[#1e2a4a]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-semibold leading-tight text-white">
              Lighthouse BBC
            </p>
            <p className="text-xs text-white/50">Management System</p>
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
          {role && topItems.map((item) => (
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
          {role && bottomItems.map((item) => (
            <SidebarItem
              key={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname.startsWith(item.href)}
              onClick={() => goTo(item.href)}
            />
          ))}

          <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 font-heading text-sm font-semibold text-[#1e2a4a]">
              PA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Pastor Admin</p>
              <p className="text-xs text-white/50">Administrator</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Sign out"
              title="Sign out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
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
