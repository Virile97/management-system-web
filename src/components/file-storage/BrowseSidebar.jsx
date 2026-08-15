import { cn } from "@/lib/utils"
import { LayoutGrid } from "lucide-react"
import { FILE_TYPE_OPTIONS } from "./file-storage.constants"
import { StorageProgressBar } from "./FileStoragePrimitives"

function BrowseSidebar({ counts, activeType, onTypeChange, stats }) {
  const allCount = stats?.totalFiles ?? 0

  return (
    <aside className="flex w-full shrink-0 flex-col border-[#E5E4E0] bg-[#F3F2EE] lg:sticky lg:top-0 lg:h-[calc(100dvh)] lg:w-[220px] lg:border-r xl:w-[240px]">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 lg:px-5">
        <nav className="flex flex-col gap-0.5">
          <p className="mb-2 px-1 text-[11px] font-semibold tracking-[0.16em] text-[#9C9A94] uppercase">
            Browse
          </p>

          <button
            type="button"
            onClick={() => onTypeChange(null)}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
              !activeType
                ? "bg-[#E8E6E1] font-semibold text-foreground"
                : "font-medium text-foreground/75 hover:bg-[#EBE9E4]"
            )}
          >
            <span className="flex items-center gap-2.5">
              <LayoutGrid className="h-4 w-4 shrink-0 stroke-[1.75]" />
              All Files
            </span>
            <span className="text-sm text-muted-foreground">{allCount}</span>
          </button>

          {FILE_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onTypeChange(value)}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                activeType === value
                  ? "bg-[#E8E6E1] font-semibold text-foreground"
                  : "font-medium text-foreground/75 hover:bg-[#EBE9E4]"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 stroke-[1.75]" />
                {label}
              </span>
              <span className="text-sm text-muted-foreground">
                {counts?.[value] ?? 0}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-[#E0DED8] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Storage</p>
            <span className="text-sm text-muted-foreground">
              {stats?.usedPercent ?? 0}%
            </span>
          </div>
          <StorageProgressBar
            usedGB={stats?.usedGB ?? 0}
            quotaGB={stats?.quotaGB ?? 5}
            usedPercent={stats?.usedPercent ?? 0}
          />
          <button
            type="button"
            className="mt-3 text-sm font-medium text-foreground/85 hover:text-foreground"
          >
            Upgrade storage →
          </button>
        </div>
      </div>
    </aside>
  )
}

export { BrowseSidebar }
export default BrowseSidebar
