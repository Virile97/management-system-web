import { getCsrfHeader } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

const getPeriodParams = ({ period = "month", from = "", to = "" } = {}) => {
  const params = new URLSearchParams({ period })
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  return params
}

function getFinanceStats(options, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.TRANSACTIONS_STATS}?${getPeriodParams(options)}`,
    { signal }
  )
}

function getTransactionsConfig(signal) {
  return fetchJson(APP_API_ENDPOINTS.TRANSACTIONS_CONFIG, { signal })
}

function getFinanceByOfferingType(options, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.TRANSACTIONS_BY_OFFERING_TYPE}?${getPeriodParams(options)}`,
    { signal }
  )
}

function getFinanceTrend(options, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.TRANSACTIONS_TREND}?${getPeriodParams(options)}`,
    { signal }
  )
}

function normalizeTransaction(transaction) {
  const type = transaction.type?.name ?? "—"
  const amount = Number(transaction.amount)

  return {
    ...transaction,
    type,
    category: transaction.category?.name ?? "—",
    recordedBy: transaction.recordedByUser?.name ?? "—",
    amount: type === "Expense" ? -Math.abs(amount) : Math.abs(amount),
  }
}

async function listTransactions(
  {
    page = 1,
    limit = 20,
    type = "",
    category = "",
    search = "",
    from = "",
    to = "",
  } = {},
  signal
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (type) params.set("type", type)
  if (category) params.set("category", category)
  if (search) params.set("search", search)
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.TRANSACTIONS}?${params}`,
    { signal }
  )

  return { data: data.map(normalizeTransaction), meta }
}

function getTransactionById(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.TRANSACTION_BY_ID(id), { signal })
}

const mutationOptions = (method, payload) => ({
  method,
  headers: { "Content-Type": "application/json", ...getCsrfHeader() },
  body: JSON.stringify(payload),
})

function createTransaction(payload) {
  return fetchJson(
    APP_API_ENDPOINTS.TRANSACTIONS,
    mutationOptions("POST", payload)
  )
}

function updateTransaction(id, payload) {
  return fetchJson(
    APP_API_ENDPOINTS.TRANSACTION_BY_ID(id),
    mutationOptions("PATCH", payload)
  )
}

function deleteTransaction(id) {
  return fetchJson(APP_API_ENDPOINTS.TRANSACTION_BY_ID(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
  })
}

function bulkDeleteTransactions(ids) {
  return fetchJson(
    APP_API_ENDPOINTS.TRANSACTIONS_BULK_DELETE,
    mutationOptions("POST", { ids })
  )
}

function formatDeleteError(err, fallback = "Unable to delete transaction") {
  if (err?.status === 403) {
    return "You don't have permission to delete transactions."
  }

  if (err?.status === 404 || err?.code === "NOT_FOUND") {
    return "This transaction was already deleted or could not be found."
  }

  return err?.message || fallback
}

export {
  getFinanceStats,
  getFinanceByOfferingType,
  getFinanceTrend,
  getTransactionsConfig,
  listTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  formatDeleteError,
}
