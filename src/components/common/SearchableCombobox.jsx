"use client"

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Plus, Search, X } from "lucide-react"

function normalizeOption(option) {
  if (option == null) return null
  if (typeof option === "string") {
    return { value: option, label: option }
  }
  const value = String(option.value ?? "")
  const label = String(option.label ?? option.value ?? "")
  if (!value && !label) return null
  return { value: value || label, label: label || value }
}

/**
 * Searchable single-select dropdown with optional free-text create.
 * Menu is portaled with fixed positioning so it works inside overflow-clipped Dialogs.
 */
function SearchableCombobox({
  options = [],
  value = "",
  onChange,
  allowCreate = true,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  disabled = false,
  clearable = true,
  className,
  emptyText = "No matches",
  createLabel = "Use",
  id,
  onOpenChange,
}) {
  const listId = useId()
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlightIndex, setHighlightIndex] = useState(0)
  const [menuStyle, setMenuStyle] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function updateOpen(next) {
    setOpen(next)
    onOpenChange?.(next)
  }

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter(Boolean),
    [options]
  )

  const selected = useMemo(() => {
    if (!value) return null
    return (
      normalizedOptions.find((option) => option.value === value) || {
        value,
        label: value,
      }
    )
  }, [normalizedOptions, value])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return normalizedOptions
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(needle)
    )
  }, [normalizedOptions, query])

  const exactMatch = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return null
    return normalizedOptions.find(
      (option) => option.label.toLowerCase() === needle
    )
  }, [normalizedOptions, query])

  const canCreate =
    allowCreate &&
    Boolean(query.trim()) &&
    !exactMatch &&
    !normalizedOptions.some(
      (option) => option.value.toLowerCase() === query.trim().toLowerCase()
    )

  const rows = useMemo(() => {
    const items = filtered.map((option) => ({
      kind: "option",
      key: option.value,
      option,
    }))
    if (canCreate) {
      items.push({
        kind: "create",
        key: `__create__:${query.trim()}`,
        label: query.trim(),
      })
    }
    return items
  }, [filtered, canCreate, query])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null)
      return
    }

    function placeMenu() {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom
      const openUp = spaceBelow < 260 && rect.top > spaceBelow
      const width = rect.width
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - width - 8
      )

      setMenuStyle({
        position: "fixed",
        left,
        width,
        zIndex: 80,
        ...(openUp
          ? { bottom: viewportHeight - rect.top + 4, top: "auto" }
          : { top: rect.bottom + 4, bottom: "auto" }),
      })
    }

    placeMenu()
    window.addEventListener("resize", placeMenu)
    window.addEventListener("scroll", placeMenu, true)
    return () => {
      window.removeEventListener("resize", placeMenu)
      window.removeEventListener("scroll", placeMenu, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    setQuery("")
    setHighlightIndex(0)
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0)

    function handlePointerDown(event) {
      const target = event.target
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      updateOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

  function selectValue(next) {
    onChange?.(next)
    updateOpen(false)
  }

  function clearValue(event) {
    event.preventDefault()
    event.stopPropagation()
    onChange?.("")
  }

  function commitHighlighted() {
    const row = rows[highlightIndex]
    if (!row) return
    if (row.kind === "create") {
      selectValue(row.label)
      return
    }
    selectValue(row.option.value)
  }

  function handleSearchKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (rows.length === 0) return
      setHighlightIndex((index) => (index + 1) % rows.length)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      if (rows.length === 0) return
      setHighlightIndex((index) => (index - 1 + rows.length) % rows.length)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      if (rows.length > 0) {
        commitHighlighted()
      } else if (allowCreate && query.trim()) {
        selectValue(query.trim())
      }
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      updateOpen(false)
    }
  }

  const menu =
    open && mounted && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
            data-searchable-combobox-menu=""
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-controls={listId}
                aria-autocomplete="list"
              />
            </div>

            <div
              id={listId}
              role="listbox"
              className="max-h-60 overflow-y-auto p-1"
            >
              {rows.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                  {emptyText}
                </p>
              ) : (
                rows.map((row, index) => {
                  const isActive = index === highlightIndex
                  if (row.kind === "create") {
                    return (
                      <button
                        key={row.key}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                          isActive ? "bg-muted" : "hover:bg-muted/70"
                        )}
                        onMouseEnter={() => setHighlightIndex(index)}
                        onClick={() => selectValue(row.label)}
                      >
                        <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate">
                          {createLabel} “{row.label}”
                        </span>
                      </button>
                    )
                  }

                  const isSelected = row.option.value === value
                  return (
                    <button
                      key={row.key}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                        isActive ? "bg-muted" : "hover:bg-muted/70"
                      )}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectValue(row.option.value)}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="min-w-0 truncate">
                        {row.option.label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (disabled) return
          updateOpen(!open)
        }}
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-card px-3 text-left text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          open && "border-ring ring-3 ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label || placeholder}
        </span>
        {clearable && selected ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={clearValue}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                clearValue(event)
              }
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {menu}
    </div>
  )
}

export { SearchableCombobox }
export default SearchableCombobox
