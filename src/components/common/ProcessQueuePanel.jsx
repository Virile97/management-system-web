"use client"

import { useEffect } from "react"
import { useProcessQueueStore } from "@/stores/processQueue.store"
import { PROCESS_STATUS } from "@/lib/process-queue"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  X,
  AlertCircle,
  ListTodo,
} from "lucide-react"

const statusLabel = {
  [PROCESS_STATUS.queued]: "Queued",
  [PROCESS_STATUS.running]: "In progress",
  [PROCESS_STATUS.succeeded]: "Done",
  [PROCESS_STATUS.failed]: "Failed",
}

function StatusIcon({ status }) {
  if (status === PROCESS_STATUS.running) {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
  }
  if (status === PROCESS_STATUS.succeeded) {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
  }
  if (status === PROCESS_STATUS.failed) {
    return <AlertCircle className="h-3.5 w-3.5 text-destructive" />
  }
  return <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
}

function ProcessQueuePanel() {
  const items = useProcessQueueStore((state) => state.items)
  const isExpanded = useProcessQueueStore((state) => state.isExpanded)
  const setExpanded = useProcessQueueStore((state) => state.setExpanded)
  const retry = useProcessQueueStore((state) => state.retry)
  const remove = useProcessQueueStore((state) => state.remove)

  useEffect(() => {
    function handleBeforeUnload(event) {
      // Only block reload while jobs are still queued/running.
      // Failed-only queues may reload freely so the user can recover later.
      if (!useProcessQueueStore.getState().hasActive()) return
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  if (items.length === 0) return null

  const activeCount = items.filter(
    (item) =>
      item.status === PROCESS_STATUS.queued ||
      item.status === PROCESS_STATUS.running
  ).length
  const failedCount = items.filter(
    (item) => item.status === PROCESS_STATUS.failed
  ).length
  const unfinishedCount = activeCount + failedCount

  const summary =
    failedCount > 0
      ? `${failedCount} failed${activeCount ? ` · ${activeCount} in progress` : ""}`
      : activeCount > 0
        ? `${activeCount} in progress…`
        : "All done"

  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-60 w-[min(100%-1.5rem,22rem)] sm:right-5 sm:bottom-5">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <button
          type="button"
          onClick={() => setExpanded(!isExpanded)}
          className="flex w-full items-center gap-2 px-3.5 py-3 text-left"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a]/10 text-[#1e2a4a] dark:bg-amber-400/15 dark:text-amber-300">
            {activeCount > 0 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : failedCount > 0 ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              Background processes
            </p>
            <p className="truncate text-xs text-muted-foreground">{summary}</p>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {unfinishedCount || items.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <ul className="max-h-72 space-y-1 overflow-y-auto border-t border-border px-2 py-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl px-2.5 py-2 hover:bg-muted/60"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    <StatusIcon status={item.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground/90">
                          {item.display.title}
                        </p>
                        {item.display.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.display.subtitle}
                          </p>
                        ) : null}
                      </div>
                      {item.display.value ? (
                        <p
                          className={cn(
                            "shrink-0 font-mono text-xs font-semibold tabular-nums",
                            item.display.tone === "negative" && "text-red-600",
                            item.display.tone === "positive" &&
                              "text-emerald-700",
                            item.display.tone === "default" &&
                              "text-foreground/80"
                          )}
                        >
                          {item.display.value}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          item.status === PROCESS_STATUS.failed &&
                            "text-destructive",
                          item.status === PROCESS_STATUS.succeeded &&
                            "text-emerald-600",
                          item.status === PROCESS_STATUS.running &&
                            "text-sky-600",
                          item.status === PROCESS_STATUS.queued &&
                            "text-muted-foreground"
                        )}
                      >
                        {item.status === PROCESS_STATUS.failed && item.error
                          ? item.error
                          : statusLabel[item.status]}
                      </span>

                      <div className="flex shrink-0 items-center gap-1">
                        {item.status === PROCESS_STATUS.failed && (
                          <button
                            type="button"
                            onClick={() => retry(item.id)}
                            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-[#1e2a4a] hover:bg-[#1e2a4a]/10 dark:text-amber-300 dark:hover:bg-amber-400/10"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Retry
                          </button>
                        )}
                        {(item.status === PROCESS_STATUS.failed ||
                          item.status === PROCESS_STATUS.succeeded ||
                          item.status === PROCESS_STATUS.queued) && (
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            aria-label="Dismiss"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export { ProcessQueuePanel }
export default ProcessQueuePanel
