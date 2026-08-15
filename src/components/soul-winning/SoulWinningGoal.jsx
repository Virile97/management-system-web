"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CalendarDays, Pencil, Plus, Sun, Target, X } from "lucide-react"
import { SoulWinningGoalSkeleton } from "@/components/soul-winning/SoulWinningSkeletons"

function formatBreakdownValue(value) {
  if (value == null || value === "") return "—"
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value)
  // Preserve API decimals (e.g. 0.3) without inventing client pace math.
  return String(number)
}

function SetGoalModal({
  open,
  onOpenChange,
  year: initialYear,
  targetCount: initialTarget,
  onSave,
  isSaving = false,
  mode = "edit",
  lockYear = true,
}) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(String(initialYear || currentYear))
  const [targetCount, setTargetCount] = useState(
    String(initialTarget || 120)
  )
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setYear(String(initialYear || currentYear))
    setTargetCount(String(initialTarget || 120))
    setError("")
  }, [open, initialYear, initialTarget, currentYear])

  async function handleSave() {
    const nextYear = Math.floor(Number(year))
    const nextTarget = Math.max(1, Math.floor(Number(targetCount)) || 1)

    if (!Number.isFinite(nextYear) || nextYear < 2000 || nextYear > 2100) {
      setError("Enter a valid year")
      return
    }

    setError("")
    try {
      await onSave?.({ year: nextYear, targetCount: nextTarget })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to save goal")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Target className="h-5 w-5 text-amber-300" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              {mode === "add" ? "Add Annual Goal" : "Edit Annual Goal"}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Set the annual soul winning target for {year || "this"} calendar
            year. Progress tracks souls won in that year.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="soul-goal-year">Year</Label>
              <Input
                id="soul-goal-year"
                type="number"
                min={2000}
                max={2100}
                step={1}
                inputMode="numeric"
                className="h-10 rounded-lg"
                value={year}
                disabled={isSaving || lockYear}
                onChange={(event) => setYear(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="soul-goal-target">Target (souls)</Label>
              <Input
                id="soul-goal-target"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                className="h-10 rounded-lg"
                value={targetCount}
                disabled={isSaving}
                onChange={(event) => setTargetCount(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSave()
                }}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t border-border px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-5"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : mode === "add" ? "Add Goal" : "Save Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PaceColumn({ label, value, hint, icon: Icon, iconClassName }) {
  return (
    <div className="flex flex-col gap-1.5 px-1 py-1 sm:px-4 sm:py-0">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-[11px]">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${iconClassName}`} />
        <span className="font-heading text-xl font-normal tabular-nums text-foreground/90 sm:text-2xl">
          {value}
        </span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
        {hint}
      </p>
    </div>
  )
}

function SoulWinningGoal({
  goal = null,
  year: yearProp,
  onGoalChange,
  isSaving = false,
  isLoading = false,
}) {
  const [isSetGoalOpen, setIsSetGoalOpen] = useState(false)

  const currentYear = new Date().getFullYear()
  const year = Number(yearProp) || Number(goal?.year) || currentYear
  // Treat as set only when API returned a goal for this viewing year.
  const hasGoal =
    Boolean(goal) &&
    (goal.year == null || Number(goal.year) === year) &&
    Number(goal.targetCount) > 0
  const title =
    goal?.title || `Annual Soul Winning Goal — ${year}`
  const currentCount = Number(goal?.currentCount) || 0
  const targetCount = Number(goal?.targetCount) || 0
  const remaining = Number(goal?.remaining) || 0
  const percent = Math.min(100, Math.round(Number(goal?.progressPercent) || 0))
  const breakdown = goal?.breakdown || null
  const isCurrentYear = year === currentYear
  const isPastYear = year < currentYear
  // Past years with an existing goal are view-only — never show Edit.
  const showAddGoal = !hasGoal
  const showEditGoal = hasGoal && !isPastYear

  if (isLoading) {
    return <SoulWinningGoalSkeleton />
  }

  return (
    <>
      <Card className="rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Target className="h-4 w-4" />
            </div>
            <h2 className="truncate text-sm font-semibold text-foreground/90 sm:text-base">
              {hasGoal ? title : `Annual Soul Winning Goal — ${year}`}
            </h2>
          </div>

          {showAddGoal || showEditGoal ? (
            <button
              type="button"
              onClick={() => setIsSetGoalOpen(true)}
              className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg border border-amber-400/80 px-3 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:border-amber-400/60 dark:text-amber-300 dark:hover:bg-amber-400/10 dark:hover:text-amber-200"
            >
              {showEditGoal ? (
                <Pencil className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {showEditGoal ? "Edit Goal" : "Add Goal"}
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {hasGoal ? (
            <>
              <p className="font-heading text-3xl font-normal tabular-nums tracking-tight text-foreground sm:text-4xl">
                <span className="text-foreground">{currentCount}</span>
                <span className="text-muted-foreground"> / {targetCount}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {isCurrentYear
                  ? "souls won this year"
                  : `souls won in ${year}`}
              </p>
            </>
          ) : (
            <>
              <p className="font-heading text-3xl font-normal tabular-nums tracking-tight text-foreground sm:text-4xl">
                {currentCount > 0 ? currentCount : "—"}
                {currentCount > 0 ? (
                  <span className="text-muted-foreground"> / —</span>
                ) : null}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentCount > 0
                  ? `souls won in ${year} · no annual goal set`
                  : `no annual goal set for ${year}`}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted sm:h-3">
          <div
            className="h-full rounded-full bg-[#2f7d4f] transition-[width] duration-300"
            style={{ width: `${hasGoal ? percent : 0}%` }}
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 text-xs text-muted-foreground sm:text-sm">
          <span>
            {hasGoal
              ? `${percent}% of annual goal reached`
              : isPastYear
                ? `No annual goal was set for ${year}`
                : `Add a ${year} goal to track annual progress`}
          </span>
          <span>
            {!hasGoal
              ? ""
              : remaining === 0
                ? "Goal reached"
                : `${remaining} more to reach goal`}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:mt-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border sm:pt-6">
          <PaceColumn
            label="Per Month"
            value={formatBreakdownValue(breakdown?.perMonth)}
            hint={
              hasGoal
                ? `to hit ${targetCount} by year-end`
                : "add a goal first"
            }
            icon={CalendarDays}
            iconClassName="text-rose-500"
          />
          <PaceColumn
            label="Per Week"
            value={formatBreakdownValue(breakdown?.perWeek)}
            hint={hasGoal ? "weekly pace needed" : "add a goal first"}
            icon={CalendarDays}
            iconClassName="text-slate-500"
          />
          <PaceColumn
            label="Per Day"
            value={formatBreakdownValue(breakdown?.perDay)}
            hint={hasGoal ? "daily average target" : "add a goal first"}
            icon={Sun}
            iconClassName="text-amber-500"
          />
        </div>
      </Card>

      <SetGoalModal
        open={isSetGoalOpen}
        onOpenChange={setIsSetGoalOpen}
        year={year}
        targetCount={hasGoal ? targetCount : 120}
        onSave={onGoalChange}
        isSaving={isSaving}
        mode={showEditGoal ? "edit" : "add"}
        lockYear
      />
    </>
  )
}

export { SoulWinningGoal }
export default SoulWinningGoal
