"use client"

import { useState } from "react"
import { Menu, Building2 } from "lucide-react"
import { Sidebar } from "@/components/layout/Sidebar"
import { SlipConfigProvider } from "@/components/settings/SlipConfigContext"

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SlipConfigProvider>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex h-screen flex-col md:ml-72">
          <header className="flex shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground/70 hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400">
                <Building2 className="h-4 w-4 text-[#1e2a4a]" strokeWidth={2} />
              </div>
              <p className="font-heading text-sm font-semibold leading-tight text-foreground">
                Lighthouse BBC
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </SlipConfigProvider>
  )
}

export { DashboardLayout }
export default DashboardLayout
