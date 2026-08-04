import { StatCard } from "@/components/dashboard/StatsCards"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { FinanceChart } from "@/components/dashboard/FinanceChart"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { Users, Heart, UserX, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{today}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          <StatCard
            label="Total Members"
            value="347"
            icon={Users}
            iconClassName="bg-muted text-muted-foreground"
            trend="+12 this month"
            trendDirection="up"
          />
          <StatCard
            label="Active Members"
            value="289"
            icon={Heart}
            iconClassName="bg-emerald-50/60 text-emerald-500"
            trend="83.3% of total"
            trendDirection="up"
          />
          <StatCard
            label="Inactive"
            value="41"
            icon={UserX}
            iconClassName="bg-amber-50/60 text-amber-500"
            trend="11.8% of total"
            trendDirection="down"
          />
          <StatCard
            label="Monthly Income"
            value="$17,300"
            icon={DollarSign}
            iconClassName="bg-muted text-muted-foreground"
            trend="+10.9% vs last month"
            trendDirection="up"
          />
          <AttendanceChart />
          <FinanceChart />
          <div className="md:col-span-2">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  )
}
