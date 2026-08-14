"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/common/EmptyState"
import { cn } from "@/lib/utils"
import { useThrottle } from "@/hooks/use-throttle"
import { searchDashboardActivity } from "@/services/dashboard.service"
import {
  Users,
  UserCog,
  DollarSign,
  Calendar,
  Clock,
  Search,
  X,
  Loader2,
  Heart,
} from "lucide-react"

const VISIBLE_ROWS = 5

const DEFAULT_META = {
  icon: Clock,
  iconClassName: "bg-muted text-muted-foreground",
}

const ACTIVITY_META = {
  MEMBER_REGISTERED: {
    icon: Users,
    iconClassName: "bg-muted text-muted-foreground",
  },
  MEMBER_STATUS_CHANGED: {
    icon: UserCog,
    iconClassName: "bg-muted text-muted-foreground",
  },
  MEMBER_UPDATED: {
    icon: UserCog,
    iconClassName: "bg-muted text-muted-foreground",
  },
  INCOME_RECORDED: {
    icon: DollarSign,
    iconClassName: "bg-amber-50/60 text-amber-500",
  },
  EXPENSE_RECORDED: {
    icon: DollarSign,
    iconClassName: "bg-amber-50/60 text-amber-500",
  },
  SOUL_WON: {
    icon: Heart,
    iconClassName: "bg-emerald-50/60 text-emerald-500",
  },
  SOUL_BAPTIZED: {
    icon: Heart,
    iconClassName: "bg-emerald-50/60 text-emerald-500",
  },
}

function formatRelativeTime(timestamp) {
  const date = new Date(timestamp)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60)
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function matchesQuery(item, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [item.message, item.detail, item.type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(q)
}

/**
 * Always renders VISIBLE_ROWS slots so the card height stays stable while
 * searching / filtering. Empty slots keep the same row chrome as filled ones.
 */
function ActivityRow({ item }) {
  const meta = item ? (ACTIVITY_META[item.type] ?? DEFAULT_META) : DEFAULT_META

  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            item ? meta.iconClassName : "invisible"
          )}
        >
          <meta.icon className="h-4 w-4" />
        </div>
        <div className={cn("min-w-0", !item && "invisible")}>
          <p className="truncate text-sm font-normal text-foreground/80">
            {item?.message || "Placeholder"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {item?.detail || "Placeholder"}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex shrink-0 items-center gap-1 pl-14 text-[11px] text-muted-foreground sm:pl-0",
          !item && "invisible"
        )}
      >
        <Calendar className="h-3 w-3" />
        <span>
          {item ? formatRelativeTime(item.timestamp) : "Just now"}
        </span>
      </div>
    </div>
  )
}

function ActivityList({ items }) {
  const slots = Array.from(
    { length: VISIBLE_ROWS },
    (_, index) => items[index] ?? null
  )

  return (
    <div className="divide-y divide-border">
      {slots.map((item, index) => (
        <ActivityRow
          key={
            item
              ? `${item.type}-${item.timestamp}-${index}`
              : `empty-slot-${index}`
          }
          item={item}
        />
      ))}
    </div>
  )
}

function RecentActivity({ items = [] }) {
  const [query, setQuery] = useState("")
  const [remoteItems, setRemoteItems] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const throttledQuery = useThrottle(query.trim(), 500)

  const localFiltered = useMemo(
    () => items.filter((item) => matchesQuery(item, throttledQuery)),
    [items, throttledQuery]
  )

  const needsRemoteSearch =
    Boolean(throttledQuery) && localFiltered.length === 0

  useEffect(() => {
    if (!needsRemoteSearch) {
      setRemoteItems([])
      setIsSearching(false)
      setSearchError("")
      return
    }

    const controller = new AbortController()
    let cancelled = false

    async function search() {
      setIsSearching(true)
      setSearchError("")

      try {
        const results = await searchDashboardActivity(
          { search: throttledQuery, limit: VISIBLE_ROWS },
          controller.signal
        )
        if (cancelled) return
        setRemoteItems(results)
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return
        setRemoteItems([])
        setSearchError(err?.message || "Unable to search activity")
      } finally {
        if (!cancelled) setIsSearching(false)
      }
    }

    search()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [needsRemoteSearch, throttledQuery])

  const hasItems = items.length > 0
  const hasQuery = query.trim().length > 0
  const displayItems = needsRemoteSearch ? remoteItems : localFiltered

  const showEmptyFeed = !hasQuery && !hasItems
  const showNoMatches =
    !isSearching && !searchError && hasQuery && displayItems.length === 0
  const showOverlay = showEmptyFeed || isSearching || searchError || showNoMatches

  let overlay = null
  if (showEmptyFeed) {
    overlay = (
      <EmptyState
        icon={Clock}
        title="No recent activity"
        description="New members and transactions will show up here."
        className="py-0"
      />
    )
  } else if (isSearching) {
    overlay = (
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Searching…
      </div>
    )
  } else if (searchError) {
    overlay = (
      <EmptyState
        icon={Search}
        title="Search failed"
        description={searchError}
        className="py-0"
      />
    )
  } else if (showNoMatches) {
    overlay = (
      <EmptyState
        icon={Search}
        title="No matching activity"
        description="Try a different name, detail, or keyword."
        className="py-0"
      />
    )
  }

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="flex flex-col gap-3 px-0 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Recent Activity
        </CardTitle>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            className={cn(
              "h-9 rounded-lg bg-background pl-9",
              hasQuery && "pr-9"
            )}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search recent activity"
          />
          {hasQuery ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="relative px-0">
        <div
          className={cn(showOverlay && "invisible")}
          aria-hidden={showOverlay || undefined}
        >
          <ActivityList items={displayItems} />
        </div>

        {overlay ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {overlay}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { RecentActivity }
export default RecentActivity
