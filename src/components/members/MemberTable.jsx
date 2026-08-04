import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MemberRow } from "@/components/members/MemberRow"
import { MemberCard } from "@/components/members/MemberCard"
import { Pagination } from "@/components/common/Pagination"

const PAGE_SIZE = 10

const members = [
  {
    id: "MEMBER:0001",
    name: "Margaret Osei",
    gender: "Female",
    email: "margaret.osei@email.com",
    phone: "+233 24 123 4567",
    group: "Choir",
    joined: "Mar 12, 2019",
    status: "Active",
  },
  {
    id: "MEMBER:0002",
    name: "David Asante",
    gender: "Male",
    email: "david.asante@email.com",
    phone: "+233 20 987 6543",
    group: "Ushers",
    joined: "Jul 22, 2017",
    status: "Inactive",
  },
  {
    id: "MEMBER:0003",
    name: "Grace Mensah",
    gender: "Female",
    email: "grace.mensah@email.com",
    phone: "+233 55 456 7890",
    group: "Women's Ministry",
    joined: "Jan 8, 2021",
    status: "Active",
  },
  {
    id: "MEMBER:0004",
    name: "Emmanuel Boateng",
    gender: "Male",
    email: "e.boateng@email.com",
    phone: "+233 26 321 0987",
    group: "Elders",
    joined: "Sep 30, 2015",
    status: "Active",
  },
  {
    id: "MEMBER:0005",
    name: "Abena Frimpong",
    gender: "Female",
    email: "abena.f@email.com",
    phone: "+233 24 654 3210",
    group: "Women's Ministry",
    joined: "Nov 14, 2018",
    status: "Deceased",
  },
  {
    id: "MEMBER:0006",
    name: "Kofi Agyeman",
    gender: "Male",
    email: "k.agyeman@email.com",
    phone: "+233 20 111 2222",
    group: "Youth",
    joined: "Apr 5, 2020",
    status: "Active",
  },
  {
    id: "MEMBER:0007",
    name: "Akosua Darko",
    gender: "Female",
    email: "akosua.d@email.com",
    phone: "+233 55 333 4444",
    group: "Choir",
    joined: "Jun 19, 2016",
    status: "Inactive",
  },
  {
    id: "MEMBER:0008",
    name: "Patrick Owusu",
    gender: "Male",
    email: "p.owusu@email.com",
    phone: "+233 26 555 6666",
    group: "Youth",
    joined: "Feb 28, 2022",
    status: "Active",
  },
  {
    id: "MEMBER:0009",
    name: "Yaa Amponsah",
    gender: "Female",
    email: "y.amponsah@email.com",
    phone: "+233 24 777 8888",
    group: "Choir",
    joined: "Aug 11, 2013",
    status: "Active",
  },
  {
    id: "MEMBER:0010",
    name: "Samuel Tetteh",
    gender: "Male",
    email: "s.tetteh@email.com",
    phone: "+233 20 999 0000",
    group: "Ushers",
    joined: "May 17, 2023",
    status: "Active",
  },
  {
    id: "MEMBER:0011",
    name: "Ama Sarpong",
    gender: "Female",
    email: "ama.s@email.com",
    phone: "+233 24 222 3333",
    group: "Women's Ministry",
    joined: "Dec 2, 2019",
    status: "Deceased",
  },
  {
    id: "MEMBER:0012",
    name: "Joseph Mensah",
    gender: "Male",
    email: "j.mensah@email.com",
    phone: "+233 26 444 5555",
    group: "Elders",
    joined: "Oct 9, 2014",
    status: "Inactive",
  },
]

function MemberTable({ members: rows, selected, onToggleSelect, onToggleSelectAll, onPrintMember }) {
  const pageRows = rows.slice(0, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const allPageSelected = pageRows.length > 0 && pageRows.every((member) => selected.has(member.email))

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="w-10 py-3 pl-4">
              <Checkbox checked={allPageSelected} onCheckedChange={() => onToggleSelectAll(pageRows)} />
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Member
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Contact
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Group
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Joined
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </th>
            <th className="py-3 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((member) => (
            <MemberRow
              key={member.email}
              member={member}
              checked={selected.has(member.email)}
              onCheckedChange={() => onToggleSelect(member)}
              onPrint={onPrintMember}
            />
          ))}
        </tbody>
      </table>

      {pageRows.length > 0 && (
        <div className="border-b border-border bg-muted/60 px-4 py-3 md:hidden">
          <label className="flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Checkbox checked={allPageSelected} onCheckedChange={() => onToggleSelectAll(pageRows)} />
            Select all
          </label>
        </div>
      )}

      <div className="md:hidden">
        {pageRows.map((member) => (
          <MemberCard
            key={member.email}
            member={member}
            checked={selected.has(member.email)}
            onCheckedChange={() => onToggleSelect(member)}
            onPrint={onPrintMember}
          />
        ))}
      </div>

      {rows.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No members found.
        </div>
      )}

      {rows.length > 0 && (
        <Pagination
          page={1}
          totalPages={totalPages}
          from={1}
          to={pageRows.length}
          total={rows.length}
        />
      )}
    </Card>
  )
}

export { MemberTable, members }
export default MemberTable
