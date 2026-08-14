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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MemberPickerField } from "@/components/finances/MemberPickerField"
import { toDateInputValue } from "@/utils/helpers"
import { Heart, X } from "lucide-react"
import { toast } from "sonner"

function emptyForm() {
  return {
    winnerMemberId: null,
    winnerName: "",
    wonAt: toDateInputValue(),
    firstName: "",
    middleName: "",
    lastName: "",
    contact: "",
    location: "",
    notes: "",
  }
}

function RecordSoulWonModal({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setForm(emptyForm())
    setError("")
    setIsSubmitting(false)
  }, [open])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const canSubmit =
    Boolean(form.winnerMemberId) &&
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim())

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return

    setIsSubmitting(true)
    setError("")

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleName: form.middleName.trim() || null,
      contact: form.contact.trim() || null,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      wonAt: form.wonAt || undefined,
      winnerMemberId: form.winnerMemberId,
    }

    try {
      await onSaved?.(payload)
      onOpenChange(false)
      toast.success("Soul winning record saved")
    } catch (err) {
      const message = err?.message || "Unable to save record"
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Heart className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Record Soul Won
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

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-1.5">
            <Label>
              Soul Winner <span className="text-red-500">*</span>
            </Label>
            <MemberPickerField
              member={
                form.winnerMemberId
                  ? { id: form.winnerMemberId, name: form.winnerName }
                  : null
              }
              onChange={(member) => {
                setForm((prev) => ({
                  ...prev,
                  winnerMemberId: member?.id || null,
                  winnerName: member?.name || "",
                }))
              }}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Pick an existing member. Converts become members only after baptism.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="soul-date">Date</Label>
            <Input
              id="soul-date"
              type="date"
              className="h-10 rounded-lg"
              value={form.wonAt}
              disabled={isSubmitting}
              onChange={(event) => updateField("wonAt", event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-first">
                First name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="convert-first"
                className="h-10 rounded-lg"
                value={form.firstName}
                disabled={isSubmitting}
                onChange={(event) => updateField("firstName", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-middle">Middle name</Label>
              <Input
                id="convert-middle"
                className="h-10 rounded-lg"
                value={form.middleName}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("middleName", event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-last">
                Last name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="convert-last"
                className="h-10 rounded-lg"
                value={form.lastName}
                disabled={isSubmitting}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="convert-phone">Contact</Label>
            <Input
              id="convert-phone"
              className="h-10 rounded-lg"
              value={form.contact}
              disabled={isSubmitting}
              onChange={(event) => updateField("contact", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="convert-address">Address / Location</Label>
            <Input
              id="convert-address"
              className="h-10 rounded-lg"
              value={form.location}
              disabled={isSubmitting}
              onChange={(event) => updateField("location", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="convert-notes">Notes</Label>
            <textarea
              id="convert-notes"
              rows={3}
              value={form.notes}
              disabled={isSubmitting}
              onChange={(event) => updateField("notes", event.target.value)}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Context about the encounter, follow-up needed, etc."
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col-reverse justify-end gap-3 rounded-b-xl border-t border-border bg-transparent px-4 py-4 sm:flex-row sm:px-6 sm:py-5">
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
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving…" : "Save Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { RecordSoulWonModal }
export default RecordSoulWonModal
