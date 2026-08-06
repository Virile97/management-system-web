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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MEMBER_FORM_VALIDATORS } from "@/utils/validators"
import { createMember, getMemberFormConfig } from "@/services/member.service"
import { useMemberFormStore } from "@/stores/memberForm.store"

// Builds the Status/Gender/Level/Lighthouse Group select configs from
// GET /members/config. Option values are the config item ids (per the
// backend contract); Gender is the one fixed enum, since it isn't part of
// the config response.
function buildSelectFields(config) {
  const toOptions = (items) => Object.fromEntries(items.map((item) => [item.id, item.name]))

  return [
    { name: "status", label: "Status", required: true, options: toOptions(config.statuses) },
    {
      name: "gender",
      label: "Gender",
      required: true,
      options: { MALE: "Male", FEMALE: "Female" },
    },
    { name: "level", label: "Level", required: true, options: toOptions(config.levels) },
    {
      name: "lighthouseGroup",
      label: "Lighthouse Group",
      options: toOptions(config.lighthouseGroups),
    },
  ]
}

function buildGroupOptions(config) {
  return Object.fromEntries(config.groups.map((item) => [item.id, item.role]))
}

function buildInitialForm(selectFields) {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
    birthDate: "",
    baptizedAt: "",
    age: "",
    groupIds: [],
    ...Object.fromEntries(selectFields.map((field) => [field.name, ""])),
  }
}

// Field config for the text/date inputs rendered via FormField below. Names
// match the backend's createMemberSchema field names. Grouped into rows
// matching the layout (name row / stacked / date+age row).
const NAME_FIELDS = [
  { name: "firstName", label: "First Name", placeholder: "e.g. Juan", required: true },
  { name: "middleName", label: "Middle Name", placeholder: "Optional" },
  { name: "lastName", label: "Last Name", placeholder: "e.g. Dela Cruz", required: true },
]

const CONTACT_FIELDS = [
  { name: "email", label: "Email", type: "email", placeholder: "name@gmail.com" },
  { name: "contact", label: "Phone", type: "tel", placeholder: "09171234567" },
  { name: "address", label: "Address", placeholder: "Street, City", required: true },
]

const DATE_AGE_FIELDS = [
  { name: "birthDate", label: "Birth Date", type: "date", required: true },
  { name: "baptizedAt", label: "Baptized Date", type: "date", required: true },
  { name: "age", label: "Age", inputMode: "numeric", placeholder: "e.g. 34", required: true },
]

function SelectField({ field, value, onChange }) {
  const { name, label, required, options } = field

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={(next) => onChange(name, next)}>
        <SelectTrigger className="h-10 w-full rounded-lg">
          <SelectValue>{(val) => options[val]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(options).map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function MultiSelectField({ label, options, value, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2 rounded-lg border border-input px-3 py-2.5">
        {Object.entries(options).map(([optionValue, optionLabel]) => (
          <label key={optionValue} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.includes(optionValue)}
              onCheckedChange={() => onToggle(optionValue)}
            />
            {optionLabel}
          </label>
        ))}
      </div>
    </div>
  )
}

function FormField({ field, value, error, onChange, onBlur }) {
  const { name, label, required, ...inputProps } = field

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`member-${name}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={`member-${name}`}
        className="h-10 rounded-lg"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        aria-invalid={Boolean(error)}
        required={required}
        {...inputProps}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function getFieldError(field, value) {
  const { required, validate } = MEMBER_FORM_VALIDATORS[field]

  if (!value) return required ?? ""
  if (validate) return validate(value)
  return ""
}

function AddMemberModal({ open, onOpenChange, onCreated }) {
  const config = useMemberFormStore((state) => state.config)
  const setConfig = useMemberFormStore((state) => state.setConfig)
  const [isConfigLoading, setIsConfigLoading] = useState(false)
  const [configError, setConfigError] = useState("")

  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    if (!open) return

    // Already cached from a previous open — skip the API call entirely.
    if (config) {
      setForm(buildInitialForm(buildSelectFields(config)))
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
  }, [open, config])

  const selectFields = config ? buildSelectFields(config) : []
  const groupOptions = config ? buildGroupOptions(config) : {}

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleToggleGroup(optionValue) {
    setForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(optionValue)
        ? prev.groupIds.filter((value) => value !== optionValue)
        : [...prev.groupIds, optionValue],
    }))
  }

  function handleBlur(field) {
    setErrors((prev) => ({ ...prev, [field]: getFieldError(field, form[field]) }))
  }

  function resetForm() {
    setForm(config ? buildInitialForm(selectFields) : null)
    setErrors({})
    setSubmitError("")
  }

  async function handleSubmit() {
    const nextErrors = Object.fromEntries(
      Object.keys(MEMBER_FORM_VALIDATORS).map((field) => [field, getFieldError(field, form[field])])
    )
    setErrors(nextErrors)

    const hasErrors = Object.values(nextErrors).some(Boolean)
    if (hasErrors) return

    setSubmitError("")
    setIsSubmitting(true)
    try {
      await createMember(form)
      resetForm()
      onCreated?.()
      onOpenChange(false)
    } catch (err) {
      setSubmitError(err?.message || "Unable to add member. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
        <DialogHeader className="flex-row items-center justify-between gap-0 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="font-heading text-lg font-normal sm:text-xl">
            Add New Member
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
          {isConfigLoading && <p className="text-sm text-muted-foreground">Loading form options…</p>}

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

              {CONTACT_FIELDS.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  error={errors[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              ))}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {DATE_AGE_FIELDS.map((field) => (
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {selectFields.map((field) => (
                  <SelectField
                    key={field.name}
                    field={field}
                    value={form[field.name]}
                    onChange={handleChange}
                  />
                ))}
              </div>

              <MultiSelectField
                label="Group"
                options={groupOptions}
                value={form.groupIds}
                onToggle={handleToggleGroup}
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormReady}
          >
            {isSubmitting ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddMemberModal }
export default AddMemberModal
