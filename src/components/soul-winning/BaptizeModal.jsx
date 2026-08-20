"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { MemberDatePicker } from "@/components/members/MemberDatePicker"
import { toDateInputValue } from "@/utils/helpers"
import { Droplets, X } from "lucide-react"

function BaptizeModal({ open, onOpenChange, record, onConfirm }) {
  const [baptizedAt, setBaptizedAt] = useState(toDateInputValue())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setBaptizedAt(toDateInputValue())
    setError("")
    setIsSubmitting(false)
  }, [open, record?.id])

  async function handleConfirm() {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError("")
    try {
      await onConfirm?.({ baptizedAt: baptizedAt || undefined })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to baptize convert")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Droplets className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Mark as Baptized
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">
            This will create an Active member for{" "}
            <span className="font-medium text-foreground/85">
              {record?.convertName || "this convert"}
            </span>{" "}
            and link it to the soul winning record.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="baptized-at">Baptism Date</Label>
            <MemberDatePicker
              id="baptized-at"
              value={baptizedAt}
              onChange={setBaptizedAt}
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-3 border-t border-border px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-5"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Confirm Baptism"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { BaptizeModal }
export default BaptizeModal
