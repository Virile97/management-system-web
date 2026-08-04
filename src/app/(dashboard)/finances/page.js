"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FinanceCards } from "@/components/finances/FinanceCards"
import { MonthlyTrendChart } from "@/components/finances/MonthlyTrendChart"
import { CategoryChart } from "@/components/finances/CategoryChart"
import { TransactionTable } from "@/components/finances/TransactionTable"
import { ScanQRModal } from "@/components/finances/ScanQRModal"
import { RecordTransactionModal } from "@/components/finances/RecordTransactionModal"
import { ScanLine, Plus } from "lucide-react"

export default function FinancesPage() {
  const [isScanQrOpen, setIsScanQrOpen] = useState(false)
  const [isRecordTransactionOpen, setIsRecordTransactionOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Finances
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track income and expenses for your church
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="h-10 gap-2 rounded-lg bg-amber-400 px-4 text-[#1e2a4a] hover:bg-amber-400/90"
              onClick={() => setIsScanQrOpen(true)}
            >
              <ScanLine className="h-4 w-4" />
              Scan QR Offering
            </Button>
            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
              onClick={() => setIsRecordTransactionOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Record Transaction
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <FinanceCards />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[3fr_2fr]">
          <MonthlyTrendChart />
          <CategoryChart />
        </div>

        <div className="mt-6">
          <TransactionTable />
        </div>
      </div>

      <ScanQRModal open={isScanQrOpen} onOpenChange={setIsScanQrOpen} />
      <RecordTransactionModal
        open={isRecordTransactionOpen}
        onOpenChange={setIsRecordTransactionOpen}
      />
    </div>
  )
}
