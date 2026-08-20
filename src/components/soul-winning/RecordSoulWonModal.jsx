"use client"
import { useEffect, useMemo, useState } from "react"
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
import { MemberSearchModal } from "@/components/finances/MemberPickerField"
import { SearchableCombobox } from "@/components/common/SearchableCombobox"
import { MemberDatePicker } from "@/components/members/MemberDatePicker"
import { toDateInputValue } from "@/utils/helpers"
import { SOUL_WINNING_EVENT_OPTIONS } from "@/utils/constants"
import { Heart, Search, X } from "lucide-react"
import { enqueueCreateSoulWinningRecord } from "@/stores/processQueue.store"
import { useAddressBookStore } from "@/stores/addressBook.store"
import { searchActiveMembers } from "@/services/member.service"
function emptyForm() {
  return {
    soulWinners: [],
    wonAt: toDateInputValue(),
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    event: "",
    contact: "",
    location: "",
    notes: "",
  }
}

function RecordSoulWonModal({ open, onOpenChange }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")
  const [isWinnerPickerOpen, setIsWinnerPickerOpen] = useState(false)
  const [isEventPickerOpen, setIsEventPickerOpen] = useState(false)
  const addresses = useAddressBookStore((state) => state.addresses)
  const addAddress = useAddressBookStore((state) => state.addAddress)
  const addressOptions = useMemo(
    () => addresses.map((address) => ({ value: address, label: address })),
    [addresses]
  )

  useEffect(() => {
    if (!open) return
    setForm(emptyForm())
    setError("")
    setIsWinnerPickerOpen(false)
    setIsEventPickerOpen(false)
  }, [open])

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addSoulWinner(member) {
    if (!member?.id) return
    setForm((prev) => {
      if (prev.soulWinners.some((w) => w.id === member.id)) return prev
      return {
        ...prev,
        soulWinners: [...prev.soulWinners, { id: member.id, name: member.name }],
      }
    })
  }

  function removeSoulWinner(id) {
    setForm((prev) => ({
      ...prev,
      soulWinners: prev.soulWinners.filter((w) => w.id !== id),
    }))
  }

  function resetForm() {
    setForm(emptyForm())
    setError("")
  }

  function handleDialogOpenChange(nextOpen) {
    // Nested pickers closing must not dismiss this form.
    if (!nextOpen && (isWinnerPickerOpen || isEventPickerOpen)) return
    onOpenChange(nextOpen)
  }

  const canSubmit =
    form.soulWinners.length > 0 &&
    Boolean(form.firstName.trim()) &&
    Boolean(form.lastName.trim()) &&
    Boolean(form.event.trim())

  function handleSubmit() {
    if (!canSubmit) return
    setError("")

    const ageRaw = String(form.age ?? "").trim()
    const age = ageRaw === "" ? null : Number.parseInt(ageRaw, 10)

    if (ageRaw !== "" && (Number.isNaN(age) || age < 0 || age > 120)) {
      setError("Age must be a number between 0 and 120")
      return
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      middleName: form.middleName.trim() || null,
      contact: form.contact.trim() || null,
      location: form.location.trim() || null,
      age,
      event: form.event.trim(),
      notes: form.notes.trim() || null,
      wonAt: form.wonAt || undefined,
      winnerMemberIds: form.soulWinners.map((w) => w.id),
    }

    const winnersLabel = form.soulWinners
      .map((w) => w.name)
      .filter(Boolean)
      .join(", ")
    // Queue so the form clears immediately and another convert can be entered
    // without waiting on the network.
    enqueueCreateSoulWinningRecord({
      payload,
      winnersLabel,
    })
    addAddress(form.location)
    resetForm()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
          onPointerDownOutside={(event) => {
            if (isWinnerPickerOpen || isEventPickerOpen) event.preventDefault()
            if (event.target?.closest?.("[data-searchable-combobox-menu]")) {
              event.preventDefault()
            }
          }}
          onInteractOutside={(event) => {
            if (isWinnerPickerOpen || isEventPickerOpen) event.preventDefault()
            if (event.target?.closest?.("[data-searchable-combobox-menu]")) {
              event.preventDefault()
            }
          }}
          onFocusOutside={(event) => {
            if (isWinnerPickerOpen || isEventPickerOpen) event.preventDefault()
            if (event.target?.closest?.("[data-searchable-combobox-menu]")) {
              event.preventDefault()
            }
          }}
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
                Soul Winner(s) <span className="text-red-500">*</span>
              </Label>

              {form.soulWinners.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {form.soulWinners.map((winner) => (
                    <li
                      key={winner.id}
                      className="flex h-10 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3"
                    >
                      <span className="min-w-0 truncate text-sm text-foreground/85">
                        {winner.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeSoulWinner(winner.id)}
                        aria-label={`Remove ${winner.name}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                onClick={() => setIsWinnerPickerOpen(true)}
                className="relative flex h-10 w-full items-center rounded-lg border border-input bg-card px-3 text-left text-sm text-muted-foreground hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {form.soulWinners.length > 0
                    ? "Add another soul winner..."
                    : "Search members..."}
                </span>
              </button>
              <p className="text-xs text-muted-foreground">
                Add one or more existing members. Converts become members only
                after baptism.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="soul-date">Date</Label>
                <MemberDatePicker
                  id="soul-date"
                  value={form.wonAt}
                  onChange={(next) => updateField("wonAt", next)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="soul-event">
                  Event <span className="text-red-500">*</span>
                </Label>
                <SearchableCombobox
                  id="soul-event"
                  options={SOUL_WINNING_EVENT_OPTIONS}
                  value={form.event}
                  onChange={(next) => updateField("event", next)}
                  onOpenChange={setIsEventPickerOpen}
                  allowCreate
                  placeholder="Select or type an event…"
                  searchPlaceholder="Search events…"
                  createLabel="Use"
                />
              </div>
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
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="convert-middle">Middle name</Label>
                <Input
                  id="convert-middle"
                  className="h-10 rounded-lg"
                  value={form.middleName}
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
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="convert-age">Age</Label>
                <Input
                  id="convert-age"
                  type="number"
                  min={0}
                  max={120}
                  inputMode="numeric"
                  className="h-10 rounded-lg"
                  placeholder="Optional"
                  value={form.age}
                  onChange={(event) => updateField("age", event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="convert-phone">Contact</Label>
                <Input
                  id="convert-phone"
                  className="h-10 rounded-lg"
                  value={form.contact}
                  onChange={(event) => updateField("contact", event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-address">Address / Location</Label>
              <SearchableCombobox
                id="convert-address"
                options={addressOptions}
                value={form.location}
                onChange={(next) => updateField("location", next)}
                allowCreate
                clearable
                placeholder="St., Brgy., City, Province"
                searchPlaceholder="Search or type an address…"
                emptyText="No saved addresses"
                createLabel="Use"
                className="[&_button]:h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="convert-notes">Notes</Label>
              <textarea
                id="convert-notes"
                rows={3}
                value={form.notes}
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

            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MemberSearchModal
        open={isWinnerPickerOpen}
        onOpenChange={setIsWinnerPickerOpen}
        onSelect={addSoulWinner}
        searchFn={searchActiveMembers}
      />
    </>
  )
}

export { RecordSoulWonModal }
export default RecordSoulWonModal
