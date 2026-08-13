"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { ProcessQueuePanel } from "@/components/common/ProcessQueuePanel"
import { SlipConfigProvider } from "@/components/settings/SlipConfigContext"
import { useAuthGuard } from "@/hooks/use-auth-guard"

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useAuthGuard("authenticated", "/login")

  return (
    <SlipConfigProvider>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex h-screen flex-col md:ml-72">
          <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground/70 hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <img
                src="/images/logo-black.png"
                alt="Lighthouse BBC"
                className="h-8 w-8 shrink-0 rounded-lg object-cover dark:hidden"
              />
              <img
                src="/images/logo.png"
                alt="Lighthouse BBC"
                className="hidden h-8 w-8 shrink-0 rounded-lg object-cover dark:block"
              />
              <p className="truncate font-heading text-sm font-semibold leading-tight text-foreground">
                Lighthouse BBC Goa
              </p>
            </div>
            <ThemeToggle className="text-foreground/70 hover:bg-muted hover:text-foreground" />
          </header>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>

        <ProcessQueuePanel />
      </div>
    </SlipConfigProvider>
  )
}

export { DashboardLayout }
export default DashboardLayout
