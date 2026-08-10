"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const categoryLabels = {
  offering: "Offering",
}

function RecordTransactionModal({ open, onOpenChange }) {
  const [type, setType] = useState("income")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="font-heading text-lg font-normal sm:text-xl">
            Record Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-input">
              <button
                type="button"
                onClick={() => setType("income")}
                className={cn(
                  "h-10 text-sm font-medium transition-colors",
                  type === "income"
                    ? "bg-emerald-600 text-white"
                    : "bg-transparent text-foreground/80 hover:bg-muted"
                )}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={cn(
                  "h-10 text-sm font-medium transition-colors",
                  type === "expense"
                    ? "bg-emerald-600 text-white"
                    : "bg-transparent text-foreground/80 hover:bg-muted"
                )}
              >
                Expense
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transaction-note">Note</Label>
            <Input
              id="transaction-note"
              placeholder="e.g. Sunday Service Tithe"
              className="h-10 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transaction-amount">Amount (PHP)</Label>
            <Input
              id="transaction-amount"
              type="number"
              placeholder="0.00"
              className="h-10 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transaction-date">Date</Label>
            <Input id="transaction-date" type="date" className="h-10 rounded-lg" />
          </div>

          {type === "income" && (
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select defaultValue="offering">
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue>{(value) => categoryLabels[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offering">Offering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col-reverse justify-end gap-3 rounded-b-xl border-t border-border bg-transparent px-4 py-4 sm:flex-row sm:px-6 sm:py-5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-5"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
          >
            Save Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { RecordTransactionModal }
export default RecordTransactionModal
