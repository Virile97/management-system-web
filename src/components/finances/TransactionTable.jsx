"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/common/Pagination"
import { cn } from "@/lib/utils"
import { Search, ArrowUpRight, ArrowDownRight } from "lucide-react"

const PAGE_SIZE = 5

const filters = ["All", "Income", "Expense"]

const categoryStyles = {
  Tithe: "bg-[#1e2a4a]/10 text-[#1e2a4a]",
  Offering: "bg-[#1e2a4a]/10 text-[#1e2a4a]",
  Utilities: "bg-amber-50 text-amber-600",
  Maintenance: "bg-amber-50 text-amber-700",
  Salaries: "bg-red-50 text-red-600",
  Donation: "bg-amber-50 text-amber-600",
}

const transactions = [
  {
    date: "Jun 15, 2026",
    description: "Sunday Service Tithe",
    category: "Tithe",
    recordedBy: "Pastor Admin",
    type: "Income",
    amount: 4200,
  },
  {
    date: "Jun 15, 2026",
    description: "Electricity bill",
    category: "Utilities",
    recordedBy: "Pastor Admin",
    type: "Expense",
    amount: -680,
  },
  {
    date: "Jun 12, 2026",
    description: "Special Offering — Missions",
    category: "Offering",
    recordedBy: "Deacon Kwame",
    type: "Income",
    amount: 2800,
  },
  {
    date: "Jun 10, 2026",
    description: "Sound equipment repair",
    category: "Maintenance",
    recordedBy: "Pastor Admin",
    type: "Expense",
    amount: -450,
  },
  {
    date: "Jun 8, 2026",
    description: "Sunday Service Tithe",
    category: "Tithe",
    recordedBy: "Pastor Admin",
    type: "Income",
    amount: 3950,
  },
  {
    date: "Jun 5, 2026",
    description: "Staff salaries",
    category: "Salaries",
    recordedBy: "Pastor Admin",
    type: "Expense",
    amount: -4200,
  },
  {
    date: "Jun 3, 2026",
    description: "Building fund donation",
    category: "Donation",
    recordedBy: "Deacon Kwame",
    type: "Income",
    amount: 1500,
  },
  {
    date: "Jun 1, 2026",
    description: "Water bill",
    category: "Utilities",
    recordedBy: "Pastor Admin",
    type: "Expense",
    amount: -320,
  },
  {
    date: "May 29, 2026",
    description: "Sunday Service Tithe",
    category: "Tithe",
    recordedBy: "Pastor Admin",
    type: "Income",
    amount: 3800,
  },
  {
    date: "May 25, 2026",
    description: "Generator maintenance",
    category: "Maintenance",
    recordedBy: "Pastor Admin",
    type: "Expense",
    amount: -510,
  },
]

function TransactionTable() {
  const [activeFilter, setActiveFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filteredTransactions = transactions
    .filter((transaction) => activeFilter === "All" || transaction.type === activeFilter)
    .filter((transaction) =>
      transaction.description.toLowerCase().includes(search.trim().toLowerCase())
    )

  const pageTransactions = filteredTransactions.slice(0, PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-8 items-center gap-1 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-border">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "flex h-full shrink-0 items-center rounded-md px-3 text-sm transition-colors",
                activeFilter === filter
                  ? "bg-[#1e2a4a] font-medium text-white"
                  : "font-normal text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="h-8 rounded-lg bg-white pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-y border-border bg-muted/60">
            <th className="py-3 pl-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Date
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Description
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Category
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Recorded By
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Type
            </th>
            <th className="py-3 pr-4 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {pageTransactions.map((transaction, index) => (
            <tr key={index} className="border-b border-border last:border-0">
              <td className="py-4 pl-4 text-sm text-foreground/80">{transaction.date}</td>
              <td className="py-4 pr-4 text-sm font-medium text-foreground/85">
                {transaction.description}
              </td>
              <td className="py-4 pr-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    categoryStyles[transaction.category]
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {transaction.category}
                </span>
              </td>
              <td className="py-4 pr-4 text-sm text-foreground/80">{transaction.recordedBy}</td>
              <td className="py-4 pr-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium",
                    transaction.type === "Income" ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {transaction.type === "Income" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {transaction.type}
                </span>
              </td>
              <td
                className={cn(
                  "py-4 pr-4 text-right text-sm font-semibold",
                  transaction.amount > 0 ? "text-emerald-600" : "text-red-500"
                )}
              >
                {transaction.amount > 0 ? "+" : "-"}$
                {Math.abs(transaction.amount).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden">
        {pageTransactions.map((transaction, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border-b border-border p-4 last:border-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-foreground/85">{transaction.description}</p>
              <span
                className={cn(
                  "shrink-0 text-right text-sm font-semibold",
                  transaction.amount > 0 ? "text-emerald-600" : "text-red-500"
                )}
              >
                {transaction.amount > 0 ? "+" : "-"}$
                {Math.abs(transaction.amount).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  categoryStyles[transaction.category]
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {transaction.category}
              </span>

              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  transaction.type === "Income" ? "text-emerald-600" : "text-red-500"
                )}
              >
                {transaction.type === "Income" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {transaction.type}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{transaction.date}</span>
              <span>{transaction.recordedBy}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No transactions found.
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <Pagination
          page={1}
          totalPages={totalPages}
          from={1}
          to={pageTransactions.length}
          total={filteredTransactions.length}
        />
      )}
    </Card>
  )
}

export { TransactionTable }
export default TransactionTable
