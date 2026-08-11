const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function formatGeneratedAt(date = new Date()) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatAmount(amount) {
  const value = Number(amount) || 0
  const formatted = currencyFormatter.format(Math.abs(value))
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return formatted
}

/**
 * Printable transactions ledger. Compact typography for letter bond paper.
 */
function TransactionsReport({
  transactions = [],
  typeFilter = "All",
  search = "",
  dateRangeLabel = "",
  scopeLabel = "Current filters",
  generatedAt = new Date(),
}) {
  const incomeTotal = transactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) > 0 ? Number(transaction.amount) : 0),
    0
  )
  const expenseTotal = transactions.reduce(
    (sum, transaction) => sum + (Number(transaction.amount) < 0 ? Math.abs(Number(transaction.amount)) : 0),
    0
  )
  const netTotal = incomeTotal - expenseTotal

  return (
    <div className="print-report-sheet flex flex-col gap-3.5 bg-white text-[11px] leading-snug text-[#1e2a4a]">
      <header className="border-b border-[#1e2a4a]/20 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium tracking-[0.14em] text-[#1e2a4a]/55 uppercase">
              Church Finances
            </p>
            <h1 className="mt-0.5 font-heading text-lg font-normal text-[#1e2a4a]">
              Transactions Report
            </h1>
            <p className="mt-1 text-[10px] text-[#1e2a4a]/70">
              Income and expense ledger for church financial records
            </p>
          </div>
          <div className="rounded-md border border-[#1e2a4a]/15 bg-[#1e2a4a]/5 px-2.5 py-1.5 text-center">
            <p className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
              Entries
            </p>
            <p className="font-heading text-lg font-normal text-[#1e2a4a] tabular-nums">
              {transactions.length}
            </p>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-[10px] sm:grid-cols-4">
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Generated
          </dt>
          <dd className="text-[#1e2a4a]/85">{formatGeneratedAt(generatedAt)}</dd>
        </div>
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">Scope</dt>
          <dd className="text-[#1e2a4a]/85">{scopeLabel}</dd>
        </div>
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Type filter
          </dt>
          <dd className="text-[#1e2a4a]/85">{typeFilter || "All"}</dd>
        </div>
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Date range
          </dt>
          <dd className="text-[#1e2a4a]/85">{dateRangeLabel || "All time"}</dd>
        </div>
        {search ? (
          <div className="col-span-2 sm:col-span-4">
            <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
              Search
            </dt>
            <dd className="text-[#1e2a4a]/85">&ldquo;{search}&rdquo;</dd>
          </div>
        ) : null}
      </dl>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-emerald-600/20 bg-emerald-50/60 px-2.5 py-1.5">
          <p className="text-[8px] font-medium tracking-wide text-emerald-700/70 uppercase">Income</p>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-emerald-700">
            {currencyFormatter.format(incomeTotal)}
          </p>
        </div>
        <div className="rounded-md border border-red-500/20 bg-red-50/60 px-2.5 py-1.5">
          <p className="text-[8px] font-medium tracking-wide text-red-600/70 uppercase">Expense</p>
          <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-red-600">
            {currencyFormatter.format(expenseTotal)}
          </p>
        </div>
        <div className="rounded-md border border-[#1e2a4a]/15 bg-[#1e2a4a]/5 px-2.5 py-1.5">
          <p className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">Net</p>
          <p
            className={`mt-0.5 text-[11px] font-semibold tabular-nums ${
              netTotal >= 0 ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {formatAmount(netTotal)}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#1e2a4a]/20 px-4 py-8 text-center text-[10px] text-[#1e2a4a]/55">
          No transactions match the current filters.
        </p>
      ) : (
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-y border-[#1e2a4a]/15">
              <th className="w-6 py-1.5 pr-1.5 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                #
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Date
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Note
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Category
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Type
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Recorded by
              </th>
              <th className="py-1.5 text-right text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => {
              const amount = Number(transaction.amount) || 0

              return (
                <tr key={transaction.id} className="border-b border-[#1e2a4a]/10 align-top">
                  <td className="py-1.5 pr-1.5 tabular-nums text-[#1e2a4a]/45">{index + 1}</td>
                  <td className="py-1.5 pr-2 whitespace-nowrap text-[#1e2a4a]/80">
                    {formatDate(transaction.createdAt || transaction.date)}
                  </td>
                  <td className="py-1.5 pr-2 font-medium text-[#1e2a4a]">
                    {transaction.description || "—"}
                  </td>
                  <td className="py-1.5 pr-2 text-[#1e2a4a]/80">{transaction.category || "—"}</td>
                  <td className="py-1.5 pr-2 text-[#1e2a4a]/80">{transaction.type || "—"}</td>
                  <td className="py-1.5 pr-2 text-[#1e2a4a]/80">{transaction.recordedBy || "—"}</td>
                  <td
                    className={`py-1.5 text-right font-semibold tabular-nums ${
                      amount > 0 ? "text-emerald-700" : amount < 0 ? "text-red-600" : "text-[#1e2a4a]"
                    }`}
                  >
                    {formatAmount(amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#1e2a4a]/20">
              <td colSpan={6} className="pt-2 pr-2 text-right text-[9px] font-medium text-[#1e2a4a]">
                Net total
              </td>
              <td
                className={`pt-2 text-right text-[10px] font-semibold tabular-nums ${
                  netTotal >= 0 ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {formatAmount(netTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  )
}

export { TransactionsReport }
export default TransactionsReport
