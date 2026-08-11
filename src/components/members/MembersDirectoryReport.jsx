function formatGeneratedAt(date = new Date()) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

/**
 * Printable members directory roster. Sized for letter via `.print-report-page`.
 * Typography is kept compact so more rows fit on bond paper.
 */
function MembersDirectoryReport({
  members = [],
  statusFilter = "All",
  search = "",
  dateRangeLabel = "",
  scopeLabel = "All matching members",
  generatedAt = new Date(),
}) {
  const statusCounts = members.reduce((counts, member) => {
    const key = member.status || "—"
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})

  const statusEntries = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="print-report-sheet flex flex-col gap-3.5 bg-white text-[11px] leading-snug text-[#1e2a4a]">
      <header className="border-b border-[#1e2a4a]/20 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium tracking-[0.14em] text-[#1e2a4a]/55 uppercase">
              Church Members
            </p>
            <h1 className="mt-0.5 font-heading text-lg font-normal text-[#1e2a4a]">
              Members Directory Report
            </h1>
            <p className="mt-1 text-[10px] text-[#1e2a4a]/70">
              Roster snapshot for records, outreach, and pastoral care
            </p>
          </div>
          <div className="rounded-md border border-[#1e2a4a]/15 bg-[#1e2a4a]/5 px-2.5 py-1.5 text-right">
            <p className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">Total</p>
            <p className="font-heading text-lg font-normal text-[#1e2a4a] tabular-nums">
              {members.length}
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
            Status filter
          </dt>
          <dd className="text-[#1e2a4a]/85">{statusFilter || "All"}</dd>
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

      {statusEntries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {statusEntries.map(([status, count]) => (
            <div
              key={status}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1e2a4a]/12 bg-[#1e2a4a]/5 px-2 py-0.5 text-[9px]"
            >
              <span className="font-medium text-[#1e2a4a]/80">{status}</span>
              <span className="tabular-nums text-[#1e2a4a]/55">{count}</span>
            </div>
          ))}
        </div>
      )}

      {members.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#1e2a4a]/20 px-4 py-8 text-center text-[10px] text-[#1e2a4a]/55">
          No members match the current filters.
        </p>
      ) : (
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="border-y border-[#1e2a4a]/15">
              <th className="w-6 py-1.5 pr-1.5 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                #
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Member
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Contact
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Status
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Group
              </th>
              <th className="py-1.5 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Baptized
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={member.id} className="border-b border-[#1e2a4a]/10 align-top">
                <td className="py-1.5 pr-1.5 tabular-nums text-[#1e2a4a]/45">{index + 1}</td>
                <td className="py-1.5 pr-2 font-medium text-[#1e2a4a]">{member.name || "—"}</td>
                <td className="py-1.5 pr-2 text-[#1e2a4a]/80">
                  <div>{member.email || "—"}</div>
                  <div className="text-[9px] text-[#1e2a4a]/55">
                    {member.phone || member.contact || "—"}
                  </div>
                </td>
                <td className="py-1.5 pr-2 text-[#1e2a4a]/80">{member.status || "—"}</td>
                <td className="py-1.5 pr-2 text-[#1e2a4a]/80">{member.group || "—"}</td>
                <td className="py-1.5 text-[#1e2a4a]/80">{member.baptized || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export { MembersDirectoryReport }
export default MembersDirectoryReport
