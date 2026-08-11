import { getCsrfHeader, hashWithNonce } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

/**
 * Verifies the admin code that gates a member's financial breakdown. Resolves
 * on success and throws with the server's message ("Incorrect access code") on
 * failure.
 *
 * The code never leaves the browser: a single-use nonce is fetched first and
 * only SHA-256("<nonce>:<code>") is posted, so the request payload holds an
 * opaque digest rather than the code itself. Each attempt takes a fresh nonce
 * since the server spends it on sight.
 */
async function verifyFinanceAccess(code) {
  const { nonce } = await fetchJson(APP_API_ENDPOINTS.MEMBERS_FINANCE_ACCESS)
  const digest = await hashWithNonce(nonce, code)

  return fetchJson(APP_API_ENDPOINTS.MEMBERS_FINANCE_ACCESS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ nonce, digest }),
  })
}

// Tab labels, in display order, mapped onto the backend's period enum.
const PERIOD_VALUES = {
  "This Week": "week",
  "This Month": "month",
  "This Year": "year",
  Custom: "custom",
}

const PERIODS = Object.keys(PERIOD_VALUES)

// Transactions recorded without an offering-type breakdown come back with a
// null offeringType; they still carry an amount, so they get a label rather
// than being hidden from the list.
const UNSPECIFIED_TYPE = "Unspecified"

/**
 * Flattens an offering line item into the flat fields the table renders, in
 * the same spirit as finance.service's normalizeTransaction.
 */
function normalizeOffering(item) {
  return {
    id: item.id,
    transactionId: item.transactionId,
    date: item.date,
    type: item.offeringType?.name ?? UNSPECIFIED_TYPE,
    amount: Number(item.amount),
    note: item.note ?? "",
  }
}

/**
 * A member's offering line items for a period, optionally narrowed to one or
 * more offering types. Paging is by transaction (`page`/`limit`, default 20,
 * max 100), so a page can return slightly more line items than `limit` when a
 * transaction has a multi-type breakdown. `meta.total` / `meta.totalPages` are
 * transaction counts; `totalRecords` is the full filtered line-item count.
 *
 * `from`/`to` ("YYYY-MM-DD") are only sent for the Custom period, which the API
 * requires both bounds for. `offeringTypeIds` are config ids, each appended as
 * a repeated `offeringTypeId` query param.
 */
async function getMemberOfferings(
  memberId,
  { period = "This Year", from = "", to = "", offeringTypeIds = [], page = 1, limit = 20 } = {},
  signal
) {
  const params = new URLSearchParams({
    period: PERIOD_VALUES[period] ?? "month",
    page: String(page),
    limit: String(limit),
  })

  if (PERIOD_VALUES[period] === "custom") {
    params.set("from", from)
    params.set("to", to)
  }

  for (const id of offeringTypeIds) {
    if (id) params.append("offeringTypeId", id)
  }

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.MEMBER_OFFERINGS(memberId)}?${params.toString()}`,
    { signal }
  )

  return {
    total: Number(data.totalOfferings) || 0,
    totalRecords: Number(data.totalRecords) || 0,
    records: (data.items ?? []).map(normalizeOffering),
    meta: meta || { page, limit, total: 0, totalPages: 1 },
    // Resolved window the backend used for this filter — drives the monthly
    // report's month list so empty months in the range still appear.
    periodRange: data.period
      ? { period: data.period.period, from: data.period.from, to: data.period.to }
      : null,
  }
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/** YYYY-MM key from an ISO date string, using the calendar date (not local TZ). */
function monthKeyFromIso(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{4})-(\d{2})/)
  if (!match) return null
  return `${match[1]}-${match[2]}`
}

function monthLabel(year, monthIndex) {
  return `Month of ${MONTH_NAMES[monthIndex]} ${year}`
}

/**
 * Walks every calendar month from `from` through `to` (inclusive) and sums
 * offering amounts into each. Months with no gifts still appear as ₱0 so a
 * firstfruit worksheet covers the whole filtered window.
 */
function buildMonthlyTotals(records, from, to) {
  const startKey = monthKeyFromIso(from)
  const endKey = monthKeyFromIso(to)

  if (!startKey || !endKey) return []

  const totals = new Map()
  for (const record of records) {
    const key = monthKeyFromIso(record.date)
    if (!key) continue
    totals.set(key, (totals.get(key) || 0) + Number(record.amount || 0))
  }

  const [startYear, startMonth] = startKey.split("-").map(Number)
  const [endYear, endMonth] = endKey.split("-").map(Number)

  const months = []
  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const key = `${year}-${String(month).padStart(2, "0")}`
    months.push({
      key,
      year,
      month: month - 1,
      label: monthLabel(year, month - 1),
      amount: totals.get(key) || 0,
    })

    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

const EXPORT_PAGE_LIMIT = 100

/**
 * Pulls every page for the current filter set and collapses line items into
 * per-month totals for the firstfruit / monthly offering worksheet.
 */
async function getMemberOfferingsMonthlyReport(
  memberId,
  { period = "This Year", from = "", to = "", offeringTypeIds = [] } = {},
  signal
) {
  const records = []
  let total = 0
  let totalRecords = 0
  let periodRange = null
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError")

    const data = await getMemberOfferings(
      memberId,
      { period, from, to, offeringTypeIds, page, limit: EXPORT_PAGE_LIMIT },
      signal
    )

    records.push(...data.records)
    total = data.total
    totalRecords = data.totalRecords
    periodRange = data.periodRange
    totalPages = Math.max(1, data.meta?.totalPages || 1)
    page += 1
  }

  // Fall back to the filter bounds / record span if the API omitted period.
  const rangeFrom =
    periodRange?.from || from || records[records.length - 1]?.date || new Date().toISOString()
  const rangeTo = periodRange?.to || to || records[0]?.date || new Date().toISOString()

  return {
    total,
    totalRecords,
    periodRange: { from: rangeFrom, to: rangeTo, period: periodRange?.period },
    months: buildMonthlyTotals(records, rangeFrom, rangeTo),
  }
}

export {
  verifyFinanceAccess,
  getMemberOfferings,
  getMemberOfferingsMonthlyReport,
  PERIODS,
  UNSPECIFIED_TYPE,
}
