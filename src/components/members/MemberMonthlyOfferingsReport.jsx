const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function formatRangeLabel(from, to) {
  if (!from || !to) return "—"

  const options = { month: "short", day: "numeric", year: "numeric" }
  const start = new Date(from).toLocaleDateString("en-US", options)
  const end = new Date(to).toLocaleDateString("en-US", options)
  return `${start} – ${end}`
}

/**
 * Printable monthly offerings worksheet for a member. Sized for short bond
 * (letter) via the `.print-report-page` print stylesheet.
 */
function MemberMonthlyOfferingsReport({
  memberName,
  periodLabel,
  periodFrom,
  periodTo,
  offeringTypeLabels = [],
  months = [],
  total = 0,
}) {
  return (
    <div className="print-report-sheet flex flex-col gap-6 bg-white text-[#1e2a4a]">
      <header className="border-b border-[#1e2a4a]/20 pb-4">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#1e2a4a]/55 uppercase">
          Monthly Offerings Report
        </p>
        <h1 className="mt-1 font-heading text-2xl font-normal text-[#1e2a4a]">
          {memberName}
        </h1>
        <p className="mt-2 text-sm text-[#1e2a4a]/70">
          For firstfruit computation — totals of offerings given each month
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-[11px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Period
          </dt>
          <dd className="text-[#1e2a4a]/85">{periodLabel}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Date range
          </dt>
          <dd className="text-[#1e2a4a]/85">
            {formatRangeLabel(periodFrom, periodTo)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[11px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Offering types
          </dt>
          <dd className="text-[#1e2a4a]/85">
            {offeringTypeLabels.length > 0
              ? offeringTypeLabels.join(", ")
              : "All types"}
          </dd>
        </div>
      </dl>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-[#1e2a4a]/15">
            <th className="py-2.5 pr-3 text-left text-[11px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
              Month
            </th>
            <th className="py-2.5 pl-3 text-right text-[11px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
              Offerings given
            </th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.key} className="border-b border-[#1e2a4a]/10">
              <td className="py-2.5 pr-3 text-[#1e2a4a]/85">{month.label}</td>
              <td className="py-2.5 pl-3 text-right font-medium text-[#1e2a4a]">
                {currencyFormatter.format(month.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[#1e2a4a]/25">
            <td className="pt-3 pr-3 text-sm font-medium text-[#1e2a4a]">
              Total
            </td>
            <td className="pt-3 pl-3 text-right text-sm font-semibold text-[#1e2a4a]">
              {currencyFormatter.format(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export { MemberMonthlyOfferingsReport }
export default MemberMonthlyOfferingsReport
