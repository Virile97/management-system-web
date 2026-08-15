"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookOpen, Check, Circle } from "lucide-react"
import { getMemberNbcJourney } from "@/services/newBelievers.service"
import { NBC_STATUS_LABELS } from "@/components/new-believers/nbc.constants"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"

function formatJourneyDate(value) {
  if (!value) return null
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function JourneyStep({ step, isLast }) {
  const isCompleted = step.state === "completed"
  const isCurrent = step.state === "current"
  const dateLabel = isCompleted
    ? formatJourneyDate(step.completedAt || step.arrivedAt)
    : isCurrent
      ? formatJourneyDate(step.arrivedAt)
      : null

  return (
    <li className="relative flex gap-3 pb-6 last:pb-0">
      {!isLast ? (
        <span
          className={cn(
            "absolute top-6 left-[11px] w-px -translate-x-1/2",
            isCompleted ? "bg-emerald-300 dark:bg-emerald-600/50" : "bg-border"
          )}
          style={{ bottom: 0 }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-[1] shrink-0 pt-0.5">
        {isCompleted ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        ) : isCurrent ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-50 dark:bg-amber-500/15">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </span>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted/40">
            <Circle className="h-2.5 w-2.5 text-muted-foreground/40" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={cn(
                  "text-sm font-medium",
                  isCurrent
                    ? "text-foreground/90"
                    : isCompleted
                      ? "text-foreground/85"
                      : "text-muted-foreground"
                )}
              >
                Lesson {step.number}: {step.title}
              </p>
              {isCurrent ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800 uppercase dark:bg-amber-500/20 dark:text-amber-300">
                  In progress
                </span>
              ) : null}
            </div>
            {step.description ? (
              <p
                className={cn(
                  "mt-0.5 text-xs leading-relaxed",
                  isCurrent || isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60"
                )}
              >
                {step.description}
              </p>
            ) : null}
          </div>
          {dateLabel ? (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {dateLabel}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function MemberNbcJourneyCard({ memberId, isNewBeliever = false }) {
  const [journey, setJourney] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!memberId) return

    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError("")
      try {
        const data = await getMemberNbcJourney(memberId, controller.signal)
        if (!controller.signal.aborted) setJourney(data)
      } catch (err) {
        if (controller.signal.aborted || err?.name === "AbortError") return
        setError(err?.message || "Unable to load journey")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [memberId])

  if (!isLoading && !error && !journey?.enrolled && !isNewBeliever) {
    return null
  }

  return (
    <Card className="rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-medium text-foreground/85">
            New Believers Journey
          </h2>
        </div>
        {journey?.enrolled ? (
          <Link
            href="/new-believers?section=assignments"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            View class
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <ListCardSkeleton rows={4} className="mt-3 border-0 p-0 shadow-none" />
      ) : error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : !journey?.enrolled ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Marked as a new believer but not yet assigned to a teacher. An admin
          can enroll them from the Assignments tab.
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-xl bg-muted/40 px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Teacher:{" "}
                <span className="font-medium text-foreground/80">
                  {journey.enrollment.teacherName}
                </span>
              </span>
              <span>
                {NBC_STATUS_LABELS[journey.enrollment.status] ||
                  journey.enrollment.status}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-[width]"
                  style={{ width: `${journey.progress.percent}%` }}
                />
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {journey.progress.completed}/{journey.progress.total}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Currently on{" "}
              <span className="font-medium text-foreground/80">
                Lesson {journey.enrollment.currentLesson.number}:{" "}
                {journey.enrollment.currentLesson.title}
              </span>
            </p>
          </div>

          <ol className="mt-5">
            {journey.steps.map((step, index) => (
              <JourneyStep
                key={step.id}
                step={step}
                isLast={index === journey.steps.length - 1}
              />
            ))}
          </ol>
        </>
      )}
    </Card>
  )
}

export { MemberNbcJourneyCard }
export default MemberNbcJourneyCard
