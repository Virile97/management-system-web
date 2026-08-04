"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PeriodTabs } from "@/components/soul-winning/PeriodTabs"
import { SoulStatsCards } from "@/components/soul-winning/SoulStatsCards"
import { RetentionBar } from "@/components/soul-winning/RetentionBar"
import { SectionTabs } from "@/components/soul-winning/SectionTabs"
import { RecordFilters } from "@/components/soul-winning/RecordFilters"
import { RecordsTable } from "@/components/soul-winning/RecordsTable"
import { Leaderboard } from "@/components/soul-winning/Leaderboard"
import { SoulTrendChart } from "@/components/soul-winning/SoulTrendChart"
import { RecordSoulWonModal } from "@/components/soul-winning/RecordSoulWonModal"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { Plus } from "lucide-react"

const records = [
  {
    id: 1,
    relativeDate: "Today",
    date: "Aug 4, 2026",
    convert: "Ama Kufuor",
    location: "Madina, Accra",
    contact: "+233 24 111 2222",
    soulWinner: "Kofi Agyeman",
    status: "New Convert",
    notes: "Met at community outreach",
  },
  {
    id: 2,
    relativeDate: "Today",
    date: "Aug 4, 2026",
    convert: "Yaw Darko",
    location: "Lapaz, Accra",
    contact: "+233 20 333 4444",
    soulWinner: "Grace Mensah",
    status: "New Convert",
    notes: "",
  },
  {
    id: 3,
    relativeDate: "Yesterday",
    date: "Aug 3, 2026",
    convert: "Adjoa Mensah",
    location: "Tema Community 4",
    contact: "+233 26 555 6666",
    soulWinner: "Emmanuel Boateng",
    status: "Active Member",
    notes: "Now attending Sunday service",
  },
  {
    id: 4,
    relativeDate: "Aug 2",
    date: "Aug 2, 2026",
    convert: "Kweku Asante",
    location: "East Legon, Accra",
    contact: "+233 55 777 8888",
    soulWinner: "Yaa Amponsah",
    status: "New Convert",
    notes: "",
  },
  {
    id: 5,
    relativeDate: "Aug 1",
    date: "Aug 1, 2026",
    convert: "Abena Owusu",
    location: "Achimota, Accra",
    contact: "+233 24 999 0000",
    soulWinner: "Kofi Agyeman",
    status: "Active Member",
    notes: "Joined youth group",
  },
]

const soulWinners = [...new Set(records.map((record) => record.soulWinner))]

const soulWinnerStats = [
  {
    name: "Kofi Agyeman",
    role: "Youth",
    since: "2020",
    saved: 2,
    active: 1,
    new: 1,
    lost: 0,
    email: "kofi.agyeman@email.com",
    phone: "+233 20 111 2222",
  },
  {
    name: "Emmanuel Boateng",
    role: "Elders",
    since: "2018",
    saved: 1,
    active: 1,
    new: 0,
    lost: 0,
    email: "e.boateng@email.com",
    phone: "+233 26 321 0987",
  },
  {
    name: "Grace Mensah",
    role: "Women's Ministry",
    since: "2019",
    saved: 1,
    active: 0,
    new: 1,
    lost: 0,
    email: "grace.mensah@email.com",
    phone: "+233 55 456 7890",
  },
  {
    name: "Yaa Amponsah",
    role: "Choir",
    since: "2020",
    saved: 1,
    active: 0,
    new: 1,
    lost: 0,
    email: "y.amponsah@email.com",
    phone: "+233 24 777 8888",
  },
  {
    name: "Margaret Osei",
    role: "Choir",
    since: "2021",
    saved: 0,
    active: 0,
    new: 0,
    lost: 0,
    email: "margaret.osei@email.com",
    phone: "+233 24 123 4567",
  },
  {
    name: "Samuel Tetteh",
    role: "Ushers",
    since: "2022",
    saved: 0,
    active: 0,
    new: 0,
    lost: 0,
    email: "s.tetteh@email.com",
    phone: "+233 20 999 0000",
  },
  {
    name: "Patrick Owusu",
    role: "Youth",
    since: "2023",
    saved: 0,
    active: 0,
    new: 0,
    lost: 0,
    email: "p.owusu@email.com",
    phone: "+233 26 555 6666",
  },
]

const statusMap = {
  "new-convert": "New Convert",
  "active-member": "Active Member",
  inactive: "Inactive",
}

export default function SoulWinningPage() {
  const [period, setPeriod] = useState("This Month")
  const [activeTab, setActiveTab] = useState("records")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [soulWinner, setSoulWinner] = useState("all")
  const [isRecordSoulOpen, setIsRecordSoulOpen] = useState(false)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [customRange, setCustomRange] = useState({
    year: 2026,
    month: 6,
    start: 1,
    end: 9,
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    utc: true,
  })

  const filteredRecords = records
    .filter((record) => status === "all" || record.status === statusMap[status])
    .filter((record) => soulWinner === "all" || record.soulWinner === soulWinner)
    .filter((record) => {
      const query = search.trim().toLowerCase()
      if (!query) return true
      return (
        record.convert.toLowerCase().includes(query) ||
        record.soulWinner.toLowerCase().includes(query)
      )
    })

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Soul Winning
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track and celebrate every soul brought into the Kingdom
            </p>
          </div>

          <Button
            className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
            onClick={() => setIsRecordSoulOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Record Soul Won
          </Button>
        </div>

        <div className="mt-6">
          <PeriodTabs
            active={period}
            onChange={setPeriod}
            recordCount={records.length}
            onCustomClick={() => setIsDateRangeOpen(true)}
          />
        </div>

        <div className="mt-6">
          <SoulStatsCards />
        </div>

        <div className="mt-6">
          <RetentionBar />
        </div>

        <div className="mt-6">
          <SectionTabs active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === "records" && (
          <div className="mt-6 flex flex-col gap-4">
            <RecordFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              soulWinner={soulWinner}
              onSoulWinnerChange={setSoulWinner}
              soulWinners={soulWinners}
              resultCount={filteredRecords.length}
            />
            <RecordsTable records={filteredRecords} />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="mt-6">
            <Leaderboard soulWinners={soulWinnerStats} />
          </div>
        )}

        {activeTab === "trend" && (
          <div className="mt-6">
            <SoulTrendChart />
          </div>
        )}

        {/* Soul Winners table hidden for now
        <div className="mt-8">
          <h2 className="font-heading text-xl font-normal text-foreground/80">
            Soul Winners
          </h2>
          <div className="mt-4">
            <SoulWinnersTable soulWinners={soulWinnerStats} />
          </div>
        </div>
        */}
      </div>

      <RecordSoulWonModal open={isRecordSoulOpen} onOpenChange={setIsRecordSoulOpen} />
      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={customRange}
        onApply={setCustomRange}
      />
    </div>
  )
}
