"use client"

import { useCallback } from "react"
import { useShallow } from "zustand/react/shallow"
import { Users, Heart, UserX, PhilippinePeso } from "lucide-react"

import { StatCard } from "@/components/dashboard/StatsCards"
import { MemberBreakdownChart } from "@/components/dashboard/MemberBreakdownChart"
import { SoulWinningChart } from "@/components/dashboard/SoulWinningChart"
import { FinanceChart } from "@/components/dashboard/FinanceChart"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import {
  StatCardSkeleton,
  ChartCardSkeleton,
  ListCardSkeleton,
} from "@/components/dashboard/DashboardSkeletons"
import { useDashboardStore } from "@/stores/dashboard.store"
import { getDashboardOverview } from "@/services/dashboard.service"
import { getSoulWinningTrends } from "@/services/soulWinning.service"
import { useAsyncData } from "@/hooks/use-async-data"

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})

export default function DashboardPage() {
  const {
    stats,
    memberBreakdown,
    financeSummary,
    attendanceSummary,
    recentActivity,
    soulWinningMonthly,
    soulWinningYear,
  } = useDashboardStore(
    useShallow((state) => ({
      stats: state.stats,
      memberBreakdown: state.memberBreakdown,
      financeSummary: state.financeSummary,
      attendanceSummary: state.attendanceSummary,
      recentActivity: state.recentActivity,
      soulWinningMonthly: state.soulWinningMonthly,
      soulWinningYear: state.soulWinningYear,
    }))
  )

  const buildTasks = useCallback(() => {
    const { setOverview, setSoulWinningTrends } = useDashboardStore.getState()
    const year = new Date().getFullYear()

    return [
      [(signal) => getDashboardOverview({}, signal), setOverview],
      [
        (signal) => getSoulWinningTrends({ period: "This Year", year }, signal),
        setSoulWinningTrends,
      ],
    ]
  }, [])

  const { isLoading, error, retry } = useAsyncData(buildTasks)

  const statCards = [
    {
      label: "Total Members",
      value: stats?.totalMembers ?? 0,
      icon: Users,
      iconClassName: "bg-muted text-muted-foreground",
    },
    {
      label: "Active Members",
      value: stats?.activeMembers ?? 0,
      icon: Heart,
      iconClassName: "bg-emerald-50/60 text-emerald-500",
    },
    {
      label: "Inactive",
      value: stats?.inactiveMembers ?? 0,
      icon: UserX,
      iconClassName: "bg-amber-50/60 text-amber-500",
    },
    {
      label: "Monthly Income",
      value: stats?.monthlyIncomeFormatted,
      icon: PhilippinePeso,
      iconClassName: "bg-muted text-muted-foreground",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-2xl text-foreground/80 sm:text-3xl">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </div>

          <div className="mt-4 sm:mt-6">
            <ListCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-2xl text-foreground/80 sm:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <button
              type="button"
              onClick={retry}
              className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
          <MemberBreakdownChart
            total={memberBreakdown?.total ?? 0}
            breakdown={memberBreakdown?.breakdown ?? []}
          />

          <SoulWinningChart data={soulWinningMonthly} year={soulWinningYear} />

          <FinanceChart data={financeSummary} />

          <AttendanceChart data={attendanceSummary} />
        </div>

        <div className="mt-4 sm:mt-6">
          <RecentActivity items={recentActivity} />
        </div>
      </div>
    </div>
  )
}
