"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { listMembers } from "@/services/member.service"
import { useMembersStore } from "@/stores/members.store"
import { cn } from "@/lib/utils"
import { Search, X, Loader2 } from "lucide-react"

const RESULT_LIMIT = 20

/**
 * Prefer the persisted members store (current page + accumulated cache) so
 * typing an already-known name never waits on the network. Returns [] when
 * nothing local matches — caller then falls back to the API.
 */
function searchLocalMembers(needle) {
  const normalized = needle.trim().toLowerCase()
  if (!normalized) return []

  const { members, cache } = useMembersStore.getState()
  const byId = { ...cache }
  for (const member of members) byId[member.id] = member

  const matches = []
  for (const member of Object.values(byId)) {
    const haystack = `${member.name || ""} ${member.email || ""}`.toLowerCase()
    if (!haystack.includes(normalized)) continue
    matches.push(member)
    if (matches.length >= RESULT_LIMIT) break
  }
  return matches
}

function MemberSearchModal({ open, onOpenChange, onSelect }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef(null)
  const debouncedQuery = useDebounce(query.trim(), 300)

  useEffect(() => {
    if (!open) return

    setQuery("")
    setResults([])
    setIsSearching(false)
    setError("")

    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return

    if (!debouncedQuery) {
      setResults([])
      setIsSearching(false)
      setError("")
      return
    }

    const localMatches = searchLocalMembers(debouncedQuery)
    if (localMatches.length > 0) {
      setResults(localMatches)
      setIsSearching(false)
      setError("")
      return
    }

    const controller = new AbortController()
    let cancelled = false

    async function search() {
      setIsSearching(true)
      setError("")

      try {
        const { data } = await listMembers(
          { page: 1, limit: RESULT_LIMIT, search: debouncedQuery },
          controller.signal
        )
        if (cancelled) return

        useMembersStore.getState().cacheMembers(data)
        setResults(data)
      } catch (err) {
        if (cancelled) return
        setResults([])
        setError(err?.message || "Unable to search members")
      } finally {
        if (!cancelled) setIsSearching(false)
      }
    }

    search()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, debouncedQuery])

  function handleSelect(nextMember) {
    onSelect?.({ id: nextMember.id, name: nextMember.name })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(36rem,calc(100vh-4rem))] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 border-b border-border px-4 py-4 sm:px-5">
          <DialogTitle className="font-heading text-lg font-normal">Search Member</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="border-b border-border px-4 py-3 sm:px-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search by name or email..."
              className="h-10 rounded-lg pl-9 pr-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!debouncedQuery ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
              Start typing to find a member.
            </p>
          ) : isSearching ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-5">
              No members found
            </p>
          ) : (
            <ul>
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={cn(
                    "border-b border-border last:border-0",
                    index === results.length - 1 && "overflow-hidden rounded-b-xl"
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-muted sm:px-5",
                      index === results.length - 1 && "rounded-b-xl"
                    )}
                    onClick={() => handleSelect(result)}
                  >
                    <span className="text-sm font-medium text-foreground/85">{result.name}</span>
                    {result.email && (
                      <span className="text-xs text-muted-foreground">{result.email}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Searchable member picker for linking an offering to a member.
 * Clicking the field opens a dedicated search modal.
 * Controlled via `member` ({ id, name } | null) + `onChange`.
 */
function MemberPickerField({ member = null, onChange, disabled = false }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  function handleClear(event) {
    event.stopPropagation()
    onChange?.(null)
  }

  return (
    <>
      {member ? (
        <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3">
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left text-sm text-foreground/85"
            onClick={() => !disabled && setIsSearchOpen(true)}
            disabled={disabled}
          >
            {member.name}
          </button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear selected member"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          disabled={disabled}
          className="relative flex h-10 w-full items-center rounded-lg border border-input bg-background px-3 text-left text-sm text-muted-foreground hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search className="mr-2 h-4 w-4 shrink-0" />
          <span>Search members...</span>
        </button>
      )}

      <MemberSearchModal
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelect={(nextMember) => onChange?.(nextMember)}
      />
    </>
  )
}

export { MemberPickerField, MemberSearchModal }
export default MemberPickerField
