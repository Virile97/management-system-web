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
import { sanitizeDecimalInput, toDateInputValue } from "@/utils/helpers"

// `type` is the UI's own "income"/"expense" discriminator (drives the URL
// param and which fields render) — kept independent of the backend's
// opaque type/category ids, which are only resolved for submission.
const TYPE_META = {
  income: { activeClass: "bg-emerald-600 text-white" },
  expense: { activeClass: "bg-red-600 text-white" },
}
const FALLBACK_TYPES = [{ name: "Income" }, { name: "Expense" }]

function findConfigId(options, name) {
  return options?.find((option) => option.name.toLowerCase() === name.toLowerCase())?.id ?? null
}

function RecordTransactionModal({
  open,
  onOpenChange,
  type = "income",
  onTypeChange,
  config,
  isConfigLoading,
  configError,
}) {
  const [categoryId, setCategoryId] = useState("")
  const [offeringAmounts, setOfferingAmounts] = useState({})

  const rawTypes = config?.types?.length ? config.types : FALLBACK_TYPES
  // Income always renders on the left, Expense on the right, regardless of
  // whatever order the backend returns them in.
  const types = [...rawTypes].sort(
    (a, b) => (a.name.toLowerCase() === "expense" ? 1 : 0) - (b.name.toLowerCase() === "expense" ? 1 : 0)
  )
  const categories = config?.categories ?? []
  const offeringTypes = config?.offeringTypes ?? []

  const offeringCategoryId = findConfigId(categories, "offering")
  const selectedCategoryId = categoryId || categories[0]?.id || ""
  const selectedCategoryName = categories.find((category) => category.id === selectedCategoryId)?.name

  function handleOfferingChange(offeringTypeId, value) {
    setOfferingAmounts((prev) => ({ ...prev, [offeringTypeId]: sanitizeDecimalInput(value) }))
  }

  const isOfferingBreakdown =
    type === "income" && offeringCategoryId && selectedCategoryId === offeringCategoryId
  const hasOfferingAmount = offeringTypes.some(
    (offeringType) => Number(offeringAmounts[offeringType.id]) > 0
  )

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
          {isConfigLoading && <p className="text-sm text-muted-foreground">Loading form options…</p>}

          {configError && <p className="text-sm text-red-500">{configError}</p>}

          <div className="flex flex-col gap-1.5">
            <Label>
              Type <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-input">
              {types.map((option) => {
                const optionKey = option.name.toLowerCase() === "expense" ? "expense" : "income"

                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => onTypeChange(optionKey)}
                    className={cn(
                      "h-10 text-sm font-medium transition-colors",
                      type === optionKey
                        ? TYPE_META[optionKey].activeClass
                        : "bg-transparent text-foreground/80 hover:bg-muted"
                    )}
                  >
                    {option.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transaction-note">
              Note <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="transaction-note"
              placeholder="e.g. Sunday Service Tithe"
              className="h-10 rounded-lg"
            />
          </div>

          {type === "expense" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="transaction-amount">
                Amount (PHP) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transaction-amount"
                type="number"
                placeholder="0.00"
                required
                className="h-10 rounded-lg"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transaction-date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transaction-date"
              type="date"
              defaultValue={toDateInputValue()}
              required
              className="h-10 rounded-lg"
            />
          </div>

          {type === "income" && (
            <div className="flex flex-col gap-1.5">
              <Label>
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCategoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue>{() => selectedCategoryName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isOfferingBreakdown && (
            <div className="flex flex-col gap-1.5">
              <Label>
                Offering Breakdown <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Enter an amount for at least one category.
              </p>
              <div className="flex max-h-70 flex-col gap-2 overflow-y-auto rounded-lg border border-input px-3 py-2.5">
                {offeringTypes.map((offeringType) => (
                  <div key={offeringType.id} className="flex items-center justify-between gap-3">
                    <Label htmlFor={`offering-${offeringType.id}`} className="text-sm font-normal">
                      {offeringType.name}:
                    </Label>
                    <Input
                      id={`offering-${offeringType.id}`}
                      inputMode="decimal"
                      placeholder="0.00"
                      value={offeringAmounts[offeringType.id] ?? ""}
                      onChange={(e) => handleOfferingChange(offeringType.id, e.target.value)}
                      className="h-9 w-32 rounded-lg"
                    />
                  </div>
                ))}
              </div>
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
            disabled={isOfferingBreakdown && !hasOfferingAmount}
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
