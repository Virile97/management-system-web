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
import { MEMBER_FORM_VALIDATORS } from "@/utils/validators"

// Select field config: each entry drives one dropdown via SelectField below.
// `options` order determines the order items render in the dropdown.
const SELECT_FIELDS = [
  {
    name: "status",
    label: "Status",
    defaultValue: "active",
    options: {
      active: "Active",
      inactive: "Inactive",
      deceased: "Deceased",
    },
  },
  {
    name: "gender",
    label: "Gender",
    defaultValue: "male",
    options: {
      male: "Male",
      female: "Female",
    },
  },
  {
    name: "group",
    label: "Group",
    defaultValue: "choir",
    options: {
      choir: "Choir",
      ushers: "Ushers",
      youth: "Youth",
      elders: "Elders",
      "womens-ministry": "Women's Ministry",
    },
  },
]

const INITIAL_FORM = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  joinDate: "",
  age: "",
  ...Object.fromEntries(SELECT_FIELDS.map((field) => [field.name, field.defaultValue])),
}

// Field config for the text/date inputs rendered via FormField below.
// Grouped into rows matching the layout (name row / stacked / date+age row).
const NAME_FIELDS = [
  { name: "firstName", label: "First Name", placeholder: "e.g. Juan", required: true },
  { name: "middleName", label: "Middle Name", placeholder: "Optional" },
  { name: "lastName", label: "Last Name", placeholder: "e.g. Dela Cruz", required: true },
]

const CONTACT_FIELDS = [
  { name: "email", label: "Email", type: "email", placeholder: "name@gmail.com", required: true },
  { name: "phone", label: "Phone", type: "tel", placeholder: "09171234567", required: true },
  { name: "address", label: "Address", placeholder: "Street, City", required: true },
]

const DATE_AGE_FIELDS = [
  { name: "joinDate", label: "Join Date", type: "date", required: true },
  { name: "age", label: "Age", inputMode: "numeric", placeholder: "e.g. 34", required: true },
]

function SelectField({ field, value, onChange }) {
  const { name, label, options } = field

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
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

function AddMemberModal({ open, onOpenChange }) {
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(INITIAL_FORM)

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleBlur(field) {
    const value = form[field]
    const { required, validate } = MEMBER_FORM_VALIDATORS[field]

    let message = ""
    if (!value) {
      message = required ?? ""
    } else if (validate) {
      message = validate(value)
    }

    setErrors((prev) => ({ ...prev, [field]: message }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SELECT_FIELDS.map((field) => (
              <SelectField
                key={field.name}
                field={field}
                value={form[field.name]}
                onChange={handleChange}
              />
            ))}
          </div>
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
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddMemberModal }
export default AddMemberModal
