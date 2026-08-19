// Standard email shape, RFC 5322-ish (simplified, no consecutive dots, no leading/trailing dot in local part)
const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@gmail\.com$/

// Exactly 11 digits, no letters/symbols (e.g. 09171234567)
const PH_PHONE_REGEX = /^\d{11}$/

/**
 * Validates that a value is a syntactically correct email address AND
 * belongs to the gmail.com domain specifically (case-insensitive).
 */
function isValidEmail(value) {
  if (typeof value !== "string") return false

  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 254) return false

  return EMAIL_REGEX.test(trimmed.toLowerCase())
}

/**
 * Validates that a value is an 11-digit phone number (e.g. 09171234567) —
 * digits only, no letters or symbols.
 */
function isValidPhilippinePhoneNumber(value) {
  if (typeof value !== "string") return false

  const trimmed = value.trim().replace(/[\s-]/g, "")
  if (!trimmed) return false

  return PH_PHONE_REGEX.test(trimmed)
}

/**
 * Validates that a value is a whole number age (digits only, no letters,
 * decimals, or signs), within a sane human range.
 */
function isValidAge(value) {
  if (typeof value === "number")
    return Number.isInteger(value) && value >= 0 && value <= 120

  if (typeof value !== "string") return false

  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return false

  const age = Number(trimmed)
  return age >= 0 && age <= 120
}

/**
 * Unicode letters, spaces, hyphens, apostrophes, and an optional trailing
 * period per word — supports names like "Peña", "José", "Mary Anne",
 * "D'Souza", or abbreviated prefixes like "Sto. Niño"/"Sto. Tomas". No
 * digits or other symbols.
 */
const NAME_REGEX = /^[\p{L}\p{M}]+\.?(?:[ '-][\p{L}\p{M}]+\.?)*$/u

/**
 * Validates that a value contains only letters (plus spaces/hyphens/apostrophes
 * between words) — no numbers or other special characters. Accented letters
 * such as ñ are allowed. Pass { optional: true } to allow an empty value.
 */
function isValidName(value, { optional = false } = {}) {
  if (typeof value !== "string") return false

  const trimmed = value.trim()
  if (!trimmed) return optional

  return NAME_REGEX.test(trimmed)
}

/**
 * Per-field validation for the Add/Edit Member forms: `required` supplies the
 * empty-value message, `validate` checks non-empty values and returns an
 * error message (or "" when valid).
 */
const MEMBER_FORM_VALIDATORS = {
  firstName: {
    required: "First name is required",
    validate: (value) =>
      !isValidName(value) ? "Letters only, no numbers or symbols" : "",
  },
  middleName: {
    validate: (value) =>
      !isValidName(value, { optional: true })
        ? "Letters only, no numbers or symbols"
        : "",
  },
  lastName: {
    required: "Last name is required",
    validate: (value) =>
      !isValidName(value) ? "Letters only, no numbers or symbols" : "",
  },
  email: {
    validate: (value) =>
      !isValidEmail(value)
        ? "Enter a valid Gmail address (e.g. name@gmail.com)"
        : "",
  },
  contact: {
    validate: (value) =>
      !isValidPhilippinePhoneNumber(value)
        ? "Enter an 11-digit phone number (e.g. 09171234567)"
        : "",
  },
  address: {
    required: "Address is required",
  },
  birthDate: {
    required: "Birth date is required",
  },
  baptizedAt: {
    required: "Baptism date is required",
  },
  age: {
    required: "Age is required",
    validate: (value) =>
      !isValidAge(value) ? "Enter a valid age (numbers only)" : "",
  },
  status: {
    required: "Status is required",
  },
  gender: {
    required: "Gender is required",
  },
  level: {
    required: "Level is required",
  },
  lighthouseGroup: {},
}

export {
  isValidEmail,
  isValidPhilippinePhoneNumber,
  isValidAge,
  isValidName,
  MEMBER_FORM_VALIDATORS,
}
