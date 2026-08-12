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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  createTransaction,
  getTransactionById,
  updateTransaction,
} from "@/services/finance.service"
import { getMemberById, normalizeMember } from "@/services/member.service"
import { useMembersStore } from "@/stores/members.store"
import { MemberPickerField } from "@/components/finances/MemberPickerField"
import { sanitizeDecimalInput, toDateInputValue } from "@/utils/helpers"
import { toast } from "sonner"

// `type` is the UI's own "income"/"expense" discriminator (drives the URL
// param and which fields render) — kept independent of the backend's
// opaque type/category ids, which are only resolved for submission.
const TYPE_META = {
  income: { activeClass: "bg-emerald-600 text-white" },
  expense: { activeClass: "bg-red-600 text-white" },
}
const FALLBACK_TYPES = [{ name: "Income" }, { name: "Expense" }]

function findConfigId(options, name) {
  return (
    options?.find((option) => option.name.toLowerCase() === name.toLowerCase())
      ?.id ?? null
  )
}

function emptyForm(type = "income") {
  return {
    type,
    description: "",
    amount: "",
    date: toDateInputValue(),
    categoryId: "",
    offeringAmounts: {},
    memberId: null,
    memberName: "",
  }
}

function formatMemberLabel(member) {
  if (!member) return ""
  if (member.name && member.name !== "—") return member.name
  return (
    [member.firstName, member.middleName, member.lastName]
      .filter(Boolean)
      .join(" ") || ""
  )
}

function extractLinkedMember(transaction) {
  const linked =
    transaction.member ||
    transaction.recordedForMember ||
    transaction.memberUser ||
    null
  const memberId = linked?.id || transaction.memberId || null
  if (!memberId) return { memberId: null, memberName: "" }

  return {
    memberId,
    memberName: formatMemberLabel(linked),
  }
}

/**
 * Resolve a display name for `memberId`: nested transaction payload first,
 * then the members Zustand cache, then a member-by-id fetch.
 */
async function resolveMemberName(memberId, existingName, signal) {
  if (existingName) return existingName

  const cached = useMembersStore.getState().cache?.[memberId]
  if (cached) {
    const label = formatMemberLabel(cached)
    if (label) return label
  }

  try {
    const member = await getMemberById(memberId, signal)
    if (signal?.aborted) return existingName
    const normalized = normalizeMember(member)
    useMembersStore.getState().cacheMembers([normalized])
    return formatMemberLabel(normalized) || "Selected member"
  } catch {
    if (signal?.aborted) return existingName
    return "Selected member"
  }
}

function transactionToForm(transaction, config) {
  const typeName =
    transaction.type?.name?.toLowerCase() === "expense" ? "expense" : "income"
  const items = transaction.items ?? transaction.breakdown ?? []
  const offeringAmounts = {}

  for (const item of items) {
    const offeringTypeId = item.offeringTypeId || item.offeringType?.id
    if (!offeringTypeId) continue
    offeringAmounts[offeringTypeId] = String(item.amount ?? "")
  }

  const { memberId, memberName } = extractLinkedMember(transaction)

  return {
    type: typeName,
    description: transaction.description ?? "",
    amount:
      transaction.amount != null
        ? String(Math.abs(Number(transaction.amount)))
        : "",
    date: toDateInputValue(transaction.createdAt || transaction.date),
    categoryId: transaction.category?.id || transaction.categoryId || "",
    offeringAmounts,
    typeId:
      transaction.type?.id ||
      transaction.typeId ||
      findConfigId(config?.types, typeName),
    memberId,
    memberName,
  }
}

function RecordTransactionModal({
  open,
  onOpenChange,
  type = "income",
  onTypeChange,
  transactionId = null,
  onSaved,
  config,
  isConfigLoading,
  configError,
}) {
  const isEditing = Boolean(transactionId)
  // Edit mode keeps form null until the transaction (and config) finish loading,
  // matching EditMemberModal so empty fields never flash.
  const [form, setForm] = useState(() =>
    transactionId ? null : emptyForm(type)
  )
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const activeType = isEditing ? form?.type || "income" : type

  const rawTypes = config?.types?.length ? config.types : FALLBACK_TYPES
  // Income always renders on the left, Expense on the right, regardless of
  // whatever order the backend returns them in. While editing, only the
  // transaction's own type is shown — switching income ↔ expense isn't allowed.
  const types = [...rawTypes]
    .filter((option) => {
      if (!isEditing) return true
      const optionKey =
        option.name.toLowerCase() === "expense" ? "expense" : "income"
      return optionKey === activeType
    })
    .sort(
      (a, b) =>
        (a.name.toLowerCase() === "expense" ? 1 : 0) -
        (b.name.toLowerCase() === "expense" ? 1 : 0)
    )
  const categories = config?.categories ?? []
  const offeringTypes = config?.offeringTypes ?? []

  const offeringCategoryId = findConfigId(categories, "offering")
  const selectedCategoryId = form?.categoryId || categories[0]?.id || ""
  const selectedCategoryName = categories.find(
    (category) => category.id === selectedCategoryId
  )?.name

  function resetState() {
    setForm(null)
    setLoadError("")
    setSubmitError("")
    setIsLoadingTransaction(false)
  }

  function handleOpenChange(next) {
    if (!next) resetState()
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open) return

    setSubmitError("")
    setLoadError("")

    // Create mode: seed a blank form each time the modal opens. Type toggles
    // while open come from the parent `type` prop and must not wipe inputs.
    if (!transactionId) {
      setForm(emptyForm(type))
      return
    }

    setForm(null)

    const controller = new AbortController()

    async function load() {
      setIsLoadingTransaction(true)
      setLoadError("")

      try {
        const transaction = await getTransactionById(
          transactionId,
          controller.signal
        )
        if (controller.signal.aborted) return

        const nextForm = transactionToForm(transaction, config)
        if (nextForm.memberId && !nextForm.memberName) {
          nextForm.memberName = await resolveMemberName(
            nextForm.memberId,
            nextForm.memberName,
            controller.signal
          )
          if (controller.signal.aborted) return
        }

        setForm(nextForm)
      } catch (err) {
        if (controller.signal.aborted) return
        setLoadError(err?.message || "Unable to load transaction")
      } finally {
        if (!controller.signal.aborted) setIsLoadingTransaction(false)
      }
    }

    load()
    return () => controller.abort()
    // `config` / `type` are read for the initial seed only; re-running on those
    // would wipe in-progress edits when the parent store updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transactionId])

  function handleTypeChange(nextType) {
    if (isEditing) {
      setForm((prev) => (prev ? { ...prev, type: nextType } : prev))
      return
    }
    onTypeChange?.(nextType)
  }

  function handleOfferingChange(offeringTypeId, value) {
    setForm((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        offeringAmounts: {
          ...prev.offeringAmounts,
          [offeringTypeId]: sanitizeDecimalInput(value),
        },
      }
    })
  }

  const isOfferingBreakdown =
    activeType === "income" &&
    offeringCategoryId &&
    selectedCategoryId === offeringCategoryId
  const hasOfferingAmount = offeringTypes.some(
    (offeringType) => Number(form?.offeringAmounts?.[offeringType.id]) > 0
  )
  const hasFlatAmount = Number(form?.amount) > 0
  const isBusy = isConfigLoading || (isEditing && isLoadingTransaction)
  const isFormReady =
    Boolean(form) && !isBusy && !(isEditing ? loadError : configError)
  const canSubmit =
    isFormReady &&
    Boolean(form?.date) &&
    (isOfferingBreakdown
      ? hasOfferingAmount && Boolean(form?.memberId)
      : hasFlatAmount)

  async function handleSubmit() {
    if (!canSubmit || !form || isSubmitting) return

    const typeId =
      form.typeId ||
      findConfigId(
        config?.types,
        activeType === "expense" ? "Expense" : "Income"
      )

    if (!typeId) {
      setSubmitError("Unable to resolve transaction type")
      return
    }

    const payload = {
      typeId,
      description: form.description.trim() || null,
      date: form.date,
      categoryId: activeType === "income" ? selectedCategoryId || null : null,
      // Offering transactions must be attributed to a member via memberId.
      memberId: isOfferingBreakdown ? form.memberId : null,
    }

    if (isOfferingBreakdown) {
      payload.breakdown = offeringTypes
        .filter(
          (offeringType) => Number(form.offeringAmounts[offeringType.id]) > 0
        )
        .map((offeringType) => ({
          offeringTypeId: offeringType.id,
          amount: Number(form.offeringAmounts[offeringType.id]),
        }))
    } else {
      payload.amount = Number(form.amount)
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      if (isEditing) {
        await updateTransaction(transactionId, payload)
        resetState()
        onSaved?.()
        onOpenChange(false)
        toast.success("Transaction updated successfully")
      } else {
        await createTransaction(payload)
        setForm(emptyForm(type))
        setSubmitError("")
        onSaved?.()
        toast.success("Transaction added successfully")
      }
    } catch (err) {
      // Keep the filled form so the user can fix and retry.
      const message =
        err?.message ||
        (isEditing
          ? "Unable to update transaction"
          : "Unable to create transaction")
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="font-heading text-lg font-normal sm:text-xl">
            {isEditing ? "Edit Transaction" : "Record Transaction"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          {isBusy && (
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Loading transaction…" : "Loading form options…"}
            </p>
          )}

          {(configError || loadError) && (
            <p className="text-sm text-red-500">{configError || loadError}</p>
          )}

          {isFormReady && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label>
                  Type <span className="text-red-500">*</span>
                </Label>
                <div
                  className={cn(
                    "grid overflow-hidden rounded-lg border border-input",
                    types.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {types.map((option) => {
                    const optionKey =
                      option.name.toLowerCase() === "expense"
                        ? "expense"
                        : "income"

                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => handleTypeChange(optionKey)}
                        disabled={isSubmitting || isEditing}
                        className={cn(
                          "h-10 text-sm font-medium transition-colors",
                          activeType === optionKey
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

              {activeType === "income" && (
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        categoryId: value,
                        // Member linkage only applies to Offering — clear it
                        // when switching away so a stale selection isn't submitted.
                        memberId:
                          value === offeringCategoryId ? prev.memberId : null,
                        memberName:
                          value === offeringCategoryId ? prev.memberName : "",
                      }))
                    }
                    disabled={isSubmitting}
                  >
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
                    Member <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Search and select the member this offering belongs to.
                  </p>
                  <MemberPickerField
                    member={
                      form.memberId
                        ? { id: form.memberId, name: form.memberName }
                        : null
                    }
                    onChange={(nextMember) =>
                      setForm((prev) => ({
                        ...prev,
                        memberId: nextMember?.id ?? null,
                        memberName: nextMember?.name ?? "",
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="transaction-note">
                  Note <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="transaction-note"
                  placeholder="e.g. Sunday Service Tithe"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-10 rounded-lg"
                />
              </div>

              {!isOfferingBreakdown && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="transaction-amount">
                    Amount (PHP) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="transaction-amount"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        amount: sanitizeDecimalInput(e.target.value),
                      }))
                    }
                    disabled={isSubmitting}
                    required
                    className="h-10 rounded-lg"
                  />
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
                      <div
                        key={offeringType.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <Label
                          htmlFor={`offering-${offeringType.id}`}
                          className="text-sm font-normal"
                        >
                          {offeringType.name}:
                        </Label>
                        <Input
                          id={`offering-${offeringType.id}`}
                          inputMode="decimal"
                          placeholder="0.00"
                          value={form.offeringAmounts[offeringType.id] ?? ""}
                          onChange={(e) =>
                            handleOfferingChange(
                              offeringType.id,
                              e.target.value
                            )
                          }
                          disabled={isSubmitting}
                          className="h-9 w-32 rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="transaction-date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="transaction-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  disabled={isSubmitting}
                  required
                  className="h-10 rounded-lg"
                />
              </div>
            </>
          )}

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col-reverse justify-end gap-3 rounded-b-xl border-t border-border bg-transparent px-4 py-4 sm:flex-row sm:px-6 sm:py-5">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-5"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={handleSubmit}
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
          >
            {isSubmitting
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Save Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { RecordTransactionModal }
export default RecordTransactionModal
