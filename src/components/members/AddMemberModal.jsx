"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MEMBER_FORM_VALIDATORS } from "@/utils/validators"
import { calculateAge } from "@/utils/helpers"
import { getMemberFormConfig } from "@/services/member.service"
import { useMemberFormStore } from "@/stores/memberForm.store"
import { enqueueCreateMember } from "@/stores/processQueue.store"
import { useAddressBookStore } from "@/stores/addressBook.store"
import {
  MemberDialogHeader,
  buildSelectFields,
  buildGroupOptions,
  buildInitialForm,
  NAME_FIELDS,
  CONTACT_FIELDS,
  DATE_AGE_FIELDS,
  SelectField,
  MultiSelectField,
  BooleanCheckboxField,
  FormField,
  AddressFormField,
  applyOptionalFieldConfig,
  getMemberFormFieldError,
} from "@/components/members/memberFormFields"
import { MemberDateFormField } from "@/components/members/MemberDatePicker"

function AddMemberModal({ open, onOpenChange }) {
  const config = useMemberFormStore((state) => state.config)
  const setConfig = useMemberFormStore((state) => state.setConfig)
  const addAddress = useAddressBookStore((state) => state.addAddress)
  const [isConfigLoading, setIsConfigLoading] = useState(false)
  const [configError, setConfigError] = useState("")

  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(null)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (!open) return

    setErrors({})
    setSubmitError("")

    // Only seed/reset when the modal opens — not on later store updates —
    // otherwise a mid-edit or failed submit can wipe the user's input.
    const existingConfig = useMemberFormStore.getState().config
    if (existingConfig) {
      setForm(buildInitialForm(buildSelectFields(existingConfig)))
      return
    }

    const controller = new AbortController()

    async function loadConfig() {
      setIsConfigLoading(true)
      setConfigError("")
      try {
        const data = await getMemberFormConfig(controller.signal)
        if (controller.signal.aborted) return

        setConfig(data)
        setForm(buildInitialForm(buildSelectFields(data)))
      } catch (err) {
        if (controller.signal.aborted) return
        setConfigError(err?.message || "Unable to load form options")
      } finally {
        if (!controller.signal.aborted) setIsConfigLoading(false)
      }
    }

    loadConfig()
    return () => controller.abort()
  }, [open, setConfig])

  const selectFields = config ? buildSelectFields(config) : []
  const groupOptions = config ? buildGroupOptions(config) : {}

  function handleChange(field, value) {
    if (field === "birthDate") {
      const age = String(calculateAge(value))
      setForm((prev) => ({ ...prev, birthDate: value, age }))
      setErrors((prev) => ({
        ...prev,
        birthDate: getMemberFormFieldError("birthDate", value),
        age: getMemberFormFieldError("age", age),
      }))
      return
    }

    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({
      ...prev,
      [field]: getMemberFormFieldError(field, value),
    }))
  }

  function handleToggleGroup(optionValue) {
    setForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(optionValue)
        ? prev.groupIds.filter((value) => value !== optionValue)
        : [...prev.groupIds, optionValue],
    }))
  }

  function handleBlur(field, nextValue) {
    const value = nextValue ?? form[field]
    setErrors((prev) => ({
      ...prev,
      [field]: getMemberFormFieldError(field, value),
    }))
  }

  function resetForm() {
    const latestConfig = useMemberFormStore.getState().config
    setForm(
      latestConfig ? buildInitialForm(buildSelectFields(latestConfig)) : null
    )
    setErrors({})
    setSubmitError("")
  }

  function handleSubmit() {
    if (!form) return

    const nextErrors = Object.fromEntries(
      Object.keys(MEMBER_FORM_VALIDATORS).map((field) => [
        field,
        getMemberFormFieldError(field, form[field]),
      ])
    )
    setErrors(nextErrors)

    const hasErrors = Object.values(nextErrors).some(Boolean)
    if (hasErrors) return

    setSubmitError("")

    // Queue the create so the form clears immediately and another member
    // can be entered without waiting on the network.
    const payload = { ...form }
    enqueueCreateMember({ form: payload })
    addAddress(form.address)
    resetForm()
  }

  function handleOpenChange(next) {
    if (!next) resetForm()
    onOpenChange(next)
  }

  const isFormReady = Boolean(form) && !isConfigLoading && !configError

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <MemberDialogHeader title="Add New Member" />

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          {isConfigLoading && (
            <p className="text-sm text-muted-foreground">
              Loading form options…
            </p>
          )}

          {configError && <p className="text-sm text-red-500">{configError}</p>}

          {isFormReady && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {NAME_FIELDS.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    error={errors[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                ))}
              </div>

              {CONTACT_FIELDS.map((field) => {
                const fieldConfig = applyOptionalFieldConfig(field)
                const FieldComponent =
                  field.name === "address" ? AddressFormField : FormField

                return (
                  <FieldComponent
                    key={field.name}
                    field={fieldConfig}
                    value={form[field.name]}
                    error={errors[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                )
              })}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {DATE_AGE_FIELDS.map((field) => {
                  const fieldConfig = applyOptionalFieldConfig(field)

                  if (field.type === "date") {
                    return (
                      <MemberDateFormField
                        key={field.name}
                        field={fieldConfig}
                        value={form[field.name]}
                        error={errors[field.name]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    )
                  }

                  return (
                    <FormField
                      key={field.name}
                      field={fieldConfig}
                      value={form[field.name]}
                      error={errors[field.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {selectFields.map((field) => (
                  <SelectField
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    error={errors[field.name]}
                    onChange={handleChange}
                  />
                ))}
              </div>

              <MultiSelectField
                label="Ministries"
                options={groupOptions}
                value={form.groupIds}
                onToggle={handleToggleGroup}
              />

              <BooleanCheckboxField
                name="isNewBeliever"
                label="New believer"
                description="Mark this member for New Believers Class"
                checked={form.isNewBeliever}
                onChange={handleChange}
              />

              <BooleanCheckboxField
                name="needsUpdate"
                label="Needs update"
                description="Flag this member's record as needing a follow-up review"
                checked={form.needsUpdate}
                onChange={handleChange}
              />
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
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
            onClick={handleSubmit}
            disabled={!isFormReady}
          >
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddMemberModal }
export default AddMemberModal
