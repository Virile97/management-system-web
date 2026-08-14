/**
 * Computes whole-years age from a birth date, relative to `now` (defaults to
 * the current date). O(1) date arithmetic, no loops — safe to call on every
 * keystroke. Returns "" for an empty/invalid birthDate.
 */
function calculateAge(birthDate, now = new Date()) {
  if (!birthDate) return ""

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ""

  let age = now.getFullYear() - birth.getFullYear()

  if (
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  ) {
    age--
  }

  return age >= 0 ? age : ""
}

/**
 * Normalizes free-typed input into a decimal number string: strips everything
 * but digits and dots, keeps a single decimal point, and caps the fraction at
 * `decimals` places. Pass decimals: 0 for whole numbers only.
 *
 * Runs per keystroke, so it stays typing-friendly — a trailing dot is
 * preserved while the user is still entering the fraction.
 */
function sanitizeDecimalInput(value, { decimals = 2 } = {}) {
  if (value == null) return ""

  const cleaned = String(value).replace(/[^\d.]/g, "")
  if (!cleaned) return ""

  const [whole, ...rest] = cleaned.split(".")
  if (!rest.length || decimals <= 0) return whole

  return `${whole || "0"}.${rest.join("").slice(0, decimals)}`
}

/**
 * Formats a date as the YYYY-MM-DD string an <input type="date"> expects,
 * read from local calendar parts — toISOString() would shift the day for
 * timezones ahead of UTC. Defaults to today.
 */
function toDateInputValue(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(value.getTime())) return ""

  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${value.getFullYear()}-${month}-${day}`
}

/**
 * Converts a { year, month, day } point (as used by DateRangeFilterModal's
 * start/end) into a "YYYY-MM-DD" string. Returns "" if point is missing.
 */
function toDateString(point) {
  if (!point) return ""

  const pad = (n) => String(n).padStart(2, "0")
  return `${point.year}-${pad(point.month + 1)}-${pad(point.day)}`
}

/**
 * Converts DateRangeFilterModal's onApply payload — { start, end } points,
 * each independently carrying its own year/month/day — into "YYYY-MM-DD"
 * from/to strings for API query params.
 */
function toDateRangeStrings({ start, end } = {}) {
  return { from: toDateString(start), to: toDateString(end ?? start) }
}

/**
 * Converts a "YYYY-MM-DD" string into a { year, month, day } point (as used
 * by DateRangeFilterModal's start/end). Returns null for an empty string.
 */
function toDatePoint(dateString) {
  if (!dateString) return null

  const date = new Date(dateString)
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  }
}

/**
 * Formats a { year, month, day } point as "MM/DD/YYYY" for display.
 */
function formatDatePoint(point) {
  return `${String(point.month + 1).padStart(2, "0")}/${String(point.day).padStart(2, "0")}/${point.year}`
}

/**
 * Formats a DateRangeFilterModal range as a display label — a single
 * "MM/DD/YYYY" if start and end are the same day, or "start – end" otherwise.
 */
function formatDateRangeLabel(range) {
  if (!range?.start) return null

  const start = formatDatePoint(range.start)
  const { end } = range

  const hasDifferentEnd =
    end &&
    (end.year !== range.start.year ||
      end.month !== range.start.month ||
      end.day !== range.start.day)

  return hasDifferentEnd ? `${start} – ${formatDatePoint(end)}` : start
}

/**
 * Resolves PeriodTabs labels into YYYY-MM-DD from/to bounds for list APIs.
 * "All Time" and unknown labels return empty bounds. Custom uses the
 * provided periodFrom/periodTo strings as-is.
 */
function toPeriodDateRange(
  period,
  periodFrom = "",
  periodTo = "",
  now = new Date()
) {
  const ymd = toDateInputValue

  if (period === "Custom") {
    return { from: periodFrom || "", to: periodTo || "" }
  }

  if (!period || period === "All Time") {
    return { from: "", to: "" }
  }

  if (period === "Today") {
    const today = ymd(now)
    return { from: today, to: today }
  }

  if (period === "This Week") {
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { from: ymd(monday), to: ymd(sunday) }
  }

  if (period === "This Month") {
    return {
      from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    }
  }

  if (period === "This Year") {
    return {
      from: ymd(new Date(now.getFullYear(), 0, 1)),
      to: ymd(new Date(now.getFullYear(), 11, 31)),
    }
  }

  return { from: "", to: "" }
}

export {
  calculateAge,
  sanitizeDecimalInput,
  toDateInputValue,
  toDateString,
  toDateRangeStrings,
  toDatePoint,
  formatDatePoint,
  formatDateRangeLabel,
  toPeriodDateRange,
}
