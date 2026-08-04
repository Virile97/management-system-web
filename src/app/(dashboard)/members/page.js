"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MemberFilters } from "@/components/members/MemberFilters"
import { MemberSearch } from "@/components/members/MemberSearch"
import { MemberTable, members } from "@/components/members/MemberTable"
import { AddMemberModal } from "@/components/members/AddMemberModal"
import { PrintSlipModal } from "@/components/members/PrintSlipModal"
import { PrintSelectedSlipsModal } from "@/components/members/PrintSelectedSlipsModal"
import { Plus, Printer } from "lucide-react"

export default function MembersPage() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState(new Set())
  const [printMember, setPrintMember] = useState(null)
  const [isPrintSelectedOpen, setIsPrintSelectedOpen] = useState(false)

  const counts = {
    All: members.length,
    Active: members.filter((member) => member.status === "Active").length,
    Inactive: members.filter((member) => member.status === "Inactive").length,
    Deceased: members.filter((member) => member.status === "Deceased").length,
  }

  const filteredMembers = members
    .filter((member) => activeFilter === "All" || member.status === activeFilter)
    .filter((member) =>
      member.name.toLowerCase().includes(search.trim().toLowerCase())
    )

  const selectedMembers = members.filter((member) => selectedEmails.has(member.email))

  function toggleSelect(member) {
    setSelectedEmails((prev) => {
      const next = new Set(prev)
      if (next.has(member.email)) {
        next.delete(member.email)
      } else {
        next.add(member.email)
      }
      return next
    })
  }

  function toggleSelectAll(pageRows) {
    setSelectedEmails((prev) => {
      const allSelected = pageRows.every((member) => prev.has(member.email))
      const next = new Set(prev)
      pageRows.forEach((member) => {
        if (allSelected) {
          next.delete(member.email)
        } else {
          next.add(member.email)
        }
      })
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Church Members
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {members.length} total members registered
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {selectedEmails.size > 0 && (
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-lg px-4"
                onClick={() => setIsPrintSelectedOpen(true)}
              >
                <Printer className="h-4 w-4" />
                Print Selected ({selectedEmails.size})
              </Button>
            )}

            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
              onClick={() => setIsAddMemberOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <MemberFilters active={activeFilter} counts={counts} onChange={setActiveFilter} />
          <MemberSearch value={search} onChange={setSearch} />
        </div>

        <div className="mt-6">
          <MemberTable
            members={filteredMembers}
            selected={selectedEmails}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onPrintMember={setPrintMember}
          />
        </div>
      </div>

      <AddMemberModal open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen} />
      <PrintSlipModal
        open={printMember !== null}
        onOpenChange={(open) => !open && setPrintMember(null)}
        member={printMember}
      />
      <PrintSelectedSlipsModal
        open={isPrintSelectedOpen}
        onOpenChange={setIsPrintSelectedOpen}
        members={selectedMembers}
      />
    </div>
  )
}
