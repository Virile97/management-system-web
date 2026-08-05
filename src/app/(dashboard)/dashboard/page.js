"use client"

import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { Users, Heart, UserX, DollarSign } from "lucide-react"

import { StatCard } from "@/components/dashboard/StatsCards"
import { MemberBreakdownChart } from "@/components/dashboard/MemberBreakdownChart"
import { SoulWinningChart } from "@/components/dashboard/SoulWinningChart"
import { FinanceChart } from "@/components/dashboard/FinanceChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import {
  StatCardSkeleton,
  ChartCardSkeleton,
  ListCardSkeleton,
} from "@/components/dashboard/DashboardSkeletons"
import { useDashboardStore } from "@/stores/dashboard.store"
import {
  getStats,
  getMemberBreakdown,
  getFinanceSummary,
  getRecentActivity,
} from "@/services/dashboard.service"

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
    recentActivity,
    isLoading,
    error,
  } = useDashboardStore(
    useShallow((state) => ({
      stats: state.stats,
      memberBreakdown: state.memberBreakdown,
      financeSummary: state.financeSummary,
      recentActivity: state.recentActivity,
      isLoading: state.isLoading,
      error: state.error,
    }))
  )

  useEffect(() => {
    const controller = new AbortController()

    const {
      setStats,
      setMemberBreakdown,
      setFinanceSummary,
      setRecentActivity,
      setLoading,
      setError,
    } = useDashboardStore.getState()

    const requests = [
      [() => getStats(controller.signal), setStats],
      [() => getMemberBreakdown(controller.signal), setMemberBreakdown],
      [() => getFinanceSummary("6m", controller.signal), setFinanceSummary],
      [() => getRecentActivity(5, controller.signal), setRecentActivity],
    ]

    async function loadDashboard() {
      setLoading(true)
      setError("")

      const results = await Promise.allSettled(requests.map(([fetchFn]) => fetchFn()))

      if (controller.signal.aborted) return

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          requests[index][1](result.value)
        }
      })

      const failed = results.find((r) => r.status === "rejected")
      if (failed?.status === "rejected") {
        setError(failed.reason.message)
      }

      setLoading(false)
    }

    loadDashboard()

    return () => controller.abort()
  }, [])

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
      icon: DollarSign,
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

          <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
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
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
          <MemberBreakdownChart
            total={memberBreakdown?.total ?? 0}
            breakdown={memberBreakdown?.breakdown ?? []}
          />

          <SoulWinningChart />

          <FinanceChart data={financeSummary} />
        </div>

        <div className="mt-4 sm:mt-6">
          <RecentActivity items={recentActivity} />
        </div>
      </div>
    </div>
  )
}