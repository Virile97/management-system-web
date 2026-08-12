import { getCsrfHeader, hashWithNonce } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

const PERIOD_VALUES = {
  "This Week": "week",
  "This Month": "month",
  "This Year": "year",
  Custom: "custom",
}

const PERIODS = Object.keys(PERIOD_VALUES)
const UNSPECIFIED_TYPE = "Unspecified"
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
const EXPORT_PAGE_LIMIT = 100

async function verifyFinanceAccess(code) {
  const { nonce } = await fetchJson(APP_API_ENDPOINTS.MEMBERS_FINANCE_ACCESS)
  const digest = await hashWithNonce(nonce, code)

  return fetchJson(APP_API_ENDPOINTS.MEMBERS_FINANCE_ACCESS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ nonce, digest }),
  })
}

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

async function getMemberOfferings(
  memberId,
  {
    period = "This Year",
    from = "",
    to = "",
    offeringTypeIds = [],
    page = 1,
    limit = 20,
  } = {},
  signal
) {
  const periodValue = PERIOD_VALUES[period] ?? "month"
  const params = new URLSearchParams({
    period: periodValue,
    page: String(page),
    limit: String(limit),
  })

  if (periodValue === "custom") {
    params.set("from", from)
    params.set("to", to)
  }

  offeringTypeIds.forEach((id) => {
    if (id) params.append("offeringTypeId", id)
  })

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.MEMBER_OFFERINGS(memberId)}?${params}`,
    { signal }
  )

  return {
    total: Number(data.totalOfferings) || 0,
    totalRecords: Number(data.totalRecords) || 0,
    records: (data.items ?? []).map(normalizeOffering),
    meta: meta || { page, limit, total: 0, totalPages: 1 },
    periodRange: data.period
      ? {
          period: data.period.period,
          from: data.period.from,
          to: data.period.to,
        }
      : null,
  }
}

function monthKeyFromIso(value) {
  const match = value && String(value).match(/^(\d{4})-(\d{2})/)
  return match ? `${match[1]}-${match[2]}` : null
}

function monthLabel(year, month) {
  return `Month of ${MONTH_NAMES[month]} ${year}`
}

function buildMonthlyTotals(records, from, to) {
  const startKey = monthKeyFromIso(from)
  const endKey = monthKeyFromIso(to)

  if (!startKey || !endKey) return []

  const totals = new Map()

  records.forEach((record) => {
    const key = monthKeyFromIso(record.date)
    if (key)
      totals.set(key, (totals.get(key) || 0) + Number(record.amount || 0))
  })

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

    if (++month > 12) {
      month = 1
      year++
    }
  }

  return months
}

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
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }

    const result = await getMemberOfferings(
      memberId,
      { period, from, to, offeringTypeIds, page, limit: EXPORT_PAGE_LIMIT },
      signal
    )

    records.push(...result.records)
    total = result.total
    totalRecords = result.totalRecords
    periodRange = result.periodRange
    totalPages = Math.max(1, result.meta?.totalPages || 1)
    page++
  }

  const rangeFrom =
    periodRange?.from ||
    from ||
    records.at(-1)?.date ||
    new Date().toISOString()

  const rangeTo =
    periodRange?.to || to || records[0]?.date || new Date().toISOString()

  return {
    total,
    totalRecords,
    periodRange: {
      from: rangeFrom,
      to: rangeTo,
      period: periodRange?.period,
    },
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
