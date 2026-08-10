import { getCsrfHeader } from "@/lib/auth"
import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

/**
 * Verifies the admin code that gates a member's financial breakdown. Resolves
 * on success and throws with the server's message ("Incorrect access code") on
 * failure — the code itself is only ever compared server-side.
 */
function verifyFinanceAccess(code) {
  return fetchJson(APP_API_ENDPOINTS.MEMBERS_FINANCE_ACCESS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ code }),
  })
}

/**
 * No per-member offering endpoint exists yet (transactions carry no member
 * linkage), so this resolves from generated data instead of calling fetchJson.
 * The signature matches the rest of the finance service (period-scoped,
 * AbortSignal-aware) so swapping in the real endpoint is a one-line change
 * here rather than a rewrite of the panel.
 */
const OFFERING_TYPES = ["Tithe", "First Fruit", "Sacrificial", "Thanksgiving", "Love"]

const PERIODS = ["Weekly", "Month", "Year", "Custom"]

function mockResolve(value, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"))
    resolve(value)
  })
}

function hashId(value) {
  let hash = 0
  for (const char of String(value)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

// Same member + year always produces the same records, so the numbers don't
// churn between renders the way Math.random() would.
function buildYearRecords(memberId, year) {
  const seed = hashId(memberId)
  const now = new Date()
  const records = []

  for (let month = 0; month < 12; month++) {
    const count = 1 + ((seed >> month) & 1)

    for (let index = 0; index < count; index++) {
      const day = 1 + ((seed + month * 7 + index * 13) % 28)
      const date = new Date(year, month, day)
      if (date > now) continue

      const type = OFFERING_TYPES[(seed + month + index) % OFFERING_TYPES.length]

      records.push({
        id: `${memberId}-${year}-${month}-${index}`,
        date: date.toISOString(),
        type,
        amount: 500 + ((seed + month * 137 + index * 61) % 18) * 100,
        note: type === "First Fruit" ? "Annual" : "",
      })
    }
  }

  return records
}

/**
 * Resolves the [start, end] window a period covers. Everything but a custom
 * range is anchored to today.
 */
function resolvePeriodRange({ period, from, to }) {
  if (period === "Custom" && from) {
    return { start: new Date(from), end: new Date(`${to || from}T23:59:59`) }
  }

  const now = new Date()

  if (period === "Weekly") {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { start, end: now }
  }

  if (period === "Month") {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
  }

  return { start: new Date(now.getFullYear(), 0, 1), end: now }
}

function getMemberOfferings(memberId, { period = "Year", from = "", to = "" } = {}, signal) {
  const { start, end } = resolvePeriodRange({ period, from, to })

  // A custom range can span more than one year, so build every year it
  // touches before filtering down to the window itself.
  const records = []
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    records.push(...buildYearRecords(memberId, year))
  }

  const inRange = records
    .filter((record) => {
      const date = new Date(record.date)
      return date >= start && date <= end
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const total = inRange.reduce((sum, record) => sum + record.amount, 0)

  return mockResolve({ total, records: inRange }, signal)
}

export { verifyFinanceAccess, getMemberOfferings, OFFERING_TYPES, PERIODS }
