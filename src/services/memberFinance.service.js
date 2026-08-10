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
  Weekly: "week",
  Monthly: "month",
  Yearly: "year",
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
  { period = "Yearly", from = "", to = "", offeringTypeIds = [], page = 1, limit = 20 } = {},
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
  }
}

export { verifyFinanceAccess, getMemberOfferings, PERIODS, UNSPECIFIED_TYPE }
