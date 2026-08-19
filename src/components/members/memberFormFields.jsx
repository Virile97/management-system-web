"use client"

import { useMemo } from "react"
import { X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogClose } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/components/common/SearchableCombobox"
import { MEMBER_FORM_VALIDATORS } from "@/utils/validators"
import { useAddressBookStore } from "@/stores/addressBook.store"

// Same header background/style as AddUserDialog's dark navy band, so every
// modal in the app (Add User, Add Member, Edit Member) reads consistently.
function MemberDialogHeader({ title }) {
  return (
    <div className="relative flex items-center gap-2.5 rounded-t-xl bg-[#1e2a4a] px-4 py-4 sm:px-6 sm:py-5">
      <span className="font-heading text-base font-medium text-white sm:text-lg">
        {title}
      </span>
      <DialogClose className="absolute top-1/2 right-4 -translate-y-1/2 text-white/70 hover:text-white">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
    </div>
  )
}

// Builds the Status/Gender/Level/Lighthouse Group select configs from
// GET /members/config. Option values are the config item ids (per the
// backend contract); Gender is the one fixed enum, since it isn't part of
// the config response.
function buildSelectFields(config) {
  const toOptions = (items) =>
    Object.fromEntries(items.map((item) => [item.id, item.name]))

  return [
    {
      name: "status",
      label: "Status",
      required: true,
      options: toOptions(config.statuses),
    },
    {
      name: "gender",
      label: "Gender",
      required: true,
      options: { MALE: "Male", FEMALE: "Female" },
    },
    {
      name: "level",
      label: "Level",
      required: true,
      options: toOptions(config.levels),
    },
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
    isNewBeliever: false,
    needsUpdate: false,
    ...Object.fromEntries(selectFields.map((field) => [field.name, ""])),
  }
}

// Field config for the text/date inputs rendered via FormField below. Names
// match the backend's member schema field names. Grouped into rows matching
// the layout (name row / stacked / date+age row).
const NAME_FIELDS = [
  {
    name: "firstName",
    label: "First Name",
    placeholder: "e.g. Juan",
    required: true,
    capitalize: true,
  },
  {
    name: "middleName",
    label: "Middle Name",
    placeholder: "Optional",
    capitalize: true,
  },
  {
    name: "lastName",
    label: "Last Name",
    placeholder: "e.g. Dela Cruz",
    required: true,
    capitalize: true,
  },
]

const CONTACT_FIELDS = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "name@gmail.com",
  },
  {
    name: "contact",
    label: "Phone",
    type: "tel",
    placeholder: "09171234567",
    digitsOnly: true,
    maxDigits: 11,
    startsWith: "0",
  },
  {
    name: "address",
    label: "Address",
    placeholder: "St., Brgy., City, Province",
    required: true,
  },
]

const DATE_AGE_FIELDS = [
  { name: "birthDate", label: "Birth Date", type: "date", required: true },
  { name: "baptizedAt", label: "Baptism Date", type: "date", required: true },
  {
    name: "age",
    label: "Age",
    inputMode: "numeric",
    placeholder: "e.g. 34",
    required: true,
  },
]

/** Optional on add/edit member forms — still validated when provided. */
const OPTIONAL_MEMBER_FIELDS = new Set(["birthDate", "age", "address"])

function applyOptionalFieldConfig(field) {
  return OPTIONAL_MEMBER_FIELDS.has(field.name)
    ? { ...field, required: false }
    : field
}

function getFieldError(field, value) {
  const { required, validate } = MEMBER_FORM_VALIDATORS[field] || {}

  if (!value) return required ?? ""
  if (validate) return validate(value)
  return ""
}

function getMemberFormFieldError(field, value) {
  if (OPTIONAL_MEMBER_FIELDS.has(field) && !value) return ""
  return getFieldError(field, value)
}

function SelectField({ field, value, onChange, error }) {
  const { name, label, required, options } = field

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={(next) => onChange(name, next)}>
        <SelectTrigger
          className="h-10 w-full rounded-lg"
          aria-invalid={Boolean(error)}
        >
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
      {error && <p className="text-xs text-red-500">{error}</p>}
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

function BooleanCheckboxField({
  name,
  label,
  description,
  checked = false,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-input px-3 py-3">
      <Checkbox
        className="mt-0.5"
        checked={Boolean(checked)}
        onCheckedChange={(next) => onChange(name, Boolean(next))}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground/85">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

function FormField({ field, value, error, onChange, onBlur }) {
  const {
    name,
    label,
    required,
    digitsOnly,
    maxDigits,
    startsWith,
    capitalize,
    ...inputProps
  } = field

  function handleChange(e) {
    let next = e.target.value

    if (digitsOnly) next = next.replace(/\D/g, "")
    if (startsWith && next && !next.startsWith(startsWith)) return
    if (maxDigits) next = next.slice(0, maxDigits)
    if (capitalize && next) {
      next = next.replace(
        /(^|\s)([a-z])/g,
        (match, boundary, letter) => boundary + letter.toUpperCase()
      )
    }

    onChange(name, next)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`member-${name}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={`member-${name}`}
        className="h-10 rounded-lg"
        value={value}
        onChange={handleChange}
        onBlur={() => onBlur(name)}
        aria-invalid={Boolean(error)}
        required={required}
        {...inputProps}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Address suggestions come from every unique address ever saved on a member
// form submit (see useAddressBookStore) — typing a new one is still allowed
// via SearchableCombobox's allowCreate.
function AddressFormField({ field, value, error, onChange, onBlur }) {
  const { name, label, required } = field
  const addresses = useAddressBookStore((state) => state.addresses)

  const options = useMemo(
    () => addresses.map((address) => ({ value: address, label: address })),
    [addresses]
  )

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`member-${name}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <SearchableCombobox
        id={`member-${name}`}
        options={options}
        value={value}
        onChange={(next) => {
          onChange(name, next)
          onBlur(name, next)
        }}
        allowCreate
        clearable
        placeholder="St., Brgy., City, Province"
        searchPlaceholder="Search or type an address…"
        emptyText="No saved addresses"
        createLabel="Use"
        className="[&_button]:h-10"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export {
  MemberDialogHeader,
  buildSelectFields,
  buildGroupOptions,
  buildInitialForm,
  NAME_FIELDS,
  CONTACT_FIELDS,
  DATE_AGE_FIELDS,
  OPTIONAL_MEMBER_FIELDS,
  applyOptionalFieldConfig,
  SelectField,
  MultiSelectField,
  BooleanCheckboxField,
  FormField,
  AddressFormField,
  getFieldError,
  getMemberFormFieldError,
}
