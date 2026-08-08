import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getFinanceStats(signal) {
  return fetchJson(APP_API_ENDPOINTS.TRANSACTIONS_STATS, { signal })
}

function getFinanceByCategory(signal) {
  return fetchJson(APP_API_ENDPOINTS.TRANSACTIONS_BY_CATEGORY, { signal })
}

function getFinanceTrend({ range = "6m" } = {}, signal) {
  const params = new URLSearchParams({ range })
  return fetchJson(`${APP_API_ENDPOINTS.TRANSACTIONS_TREND}?${params.toString()}`, { signal })
}

// Flattens the API's nested { type: {name}, category: {name}, recordedByUser }
// shape into flat fields the table renders directly, and signs the amount by
// type (Income positive, Expense negative) to match existing UI conventions.
function normalizeTransaction(transaction) {
  const amount = Number(transaction.amount)
  const type = transaction.type?.name ?? "—"

  return {
    ...transaction,
    type,
    category: transaction.category?.name ?? "—",
    recordedBy: transaction.recordedByUser?.name ?? "—",
    amount: type === "Expense" ? -Math.abs(amount) : Math.abs(amount),
  }
}

async function listTransactions(
  { page = 1, limit = 20, type = "", category = "", search = "", from = "", to = "" } = {},
  signal
) {
  const params = new URLSearchParams()

  params.set("page", String(page))
  params.set("limit", String(limit))

  if (type) params.set("type", type)
  if (category) params.set("category", category)
  if (search) params.set("search", search)
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  const { data, meta } = await fetchWithMeta(`${APP_API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`, { signal })

  return { data: data.map(normalizeTransaction), meta }
}

function getTransactionById(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.TRANSACTION_BY_ID(id), { signal })
}

export { getFinanceStats, getFinanceByCategory, getFinanceTrend, listTransactions, getTransactionById }
