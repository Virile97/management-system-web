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
 * Printable attendance ledger for a single service day.
 * Compact typography for letter bond paper.
 */
function AttendanceReport({
  rows = [],
  summary = null,
  dateLabel = "",
  levelFilter = "All",
  search = "",
  scopeLabel = "Current filters",
  generatedAt = new Date(),
}) {
  const stats = [
    {
      label: "Present",
      value: summary?.present ?? rows.filter((row) => row.status).length,
    },
    { label: "Full day", value: summary?.fullDay ?? 0 },
    { label: "Partial", value: summary?.partial ?? 0 },
    { label: "Absent", value: summary?.absent ?? 0 },
  ]

  return (
    <div className="print-report-sheet flex flex-col gap-3.5 bg-white text-[11px] leading-snug text-[#1e2a4a]">
      <header className="border-b border-[#1e2a4a]/20 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium tracking-[0.14em] text-[#1e2a4a]/55 uppercase">
              Church Attendance
            </p>
            <h1 className="mt-0.5 font-heading text-lg font-normal text-[#1e2a4a]">
              Attendance Report
            </h1>
            <p className="mt-1 text-[10px] text-[#1e2a4a]/70">
              Morning and afternoon session ledger for church records
            </p>
          </div>
          <div className="rounded-md border border-[#1e2a4a]/15 bg-[#1e2a4a]/5 px-2.5 py-1.5 text-center">
            <p className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
              Members
            </p>
            <p className="font-heading text-lg font-normal text-[#1e2a4a] tabular-nums">
              {rows.length}
            </p>
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-[10px] sm:grid-cols-4">
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Generated
          </dt>
          <dd className="text-[#1e2a4a]/85">
            {formatGeneratedAt(generatedAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Scope
          </dt>
          <dd className="text-[#1e2a4a]/85">{scopeLabel}</dd>
        </div>
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Date
          </dt>
          <dd className="text-[#1e2a4a]/85">{dateLabel || "—"}</dd>
        </div>
        <div>
          <dt className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
            Level
          </dt>
          <dd className="text-[#1e2a4a]/85">
            {levelFilter === "All"
              ? "All Members"
              : levelFilter || "All Members"}
          </dd>
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-[#1e2a4a]/15 bg-[#1e2a4a]/5 px-2.5 py-1.5"
          >
            <p className="text-[8px] font-medium tracking-wide text-[#1e2a4a]/45 uppercase">
              {stat.label}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#1e2a4a]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {summary?.attendanceRate != null && (
        <p className="text-[10px] text-[#1e2a4a]/70">
          Attendance rate:{" "}
          <span className="font-semibold text-[#1e2a4a]">
            {summary.attendanceRate}%
          </span>
          {summary.partialMorning != null ||
          summary.partialAfternoon != null ? (
            <>
              {" "}
              · Partial: {summary.partialMorning ?? 0} morning ·{" "}
              {summary.partialAfternoon ?? 0} afternoon
            </>
          ) : null}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#1e2a4a]/20 px-4 py-8 text-center text-[10px] text-[#1e2a4a]/55">
          No attendance records match the current filters.
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
                Level
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-amber-700/80 uppercase">
                Morning In
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-amber-700/80 uppercase">
                Morning Out
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-blue-700/80 uppercase">
                Afternoon In
              </th>
              <th className="py-1.5 pr-2 text-left text-[8px] font-medium tracking-wide text-blue-700/80 uppercase">
                Afternoon Out
              </th>
              <th className="py-1.5 text-left text-[8px] font-medium tracking-wide text-[#1e2a4a]/55 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id || index}
                className="border-b border-[#1e2a4a]/10 align-top"
              >
                <td className="py-1.5 pr-1.5 tabular-nums text-[#1e2a4a]/45">
                  {index + 1}
                </td>
                <td className="py-1.5 pr-2 font-medium text-[#1e2a4a]">
                  {row.name || "—"}
                </td>
                <td className="py-1.5 pr-2 text-[#1e2a4a]/80">
                  {row.level || "—"}
                </td>
                <td className="py-1.5 pr-2 tabular-nums text-[#1e2a4a]/80">
                  {row.morningIn || "—"}
                </td>
                <td className="py-1.5 pr-2 tabular-nums text-[#1e2a4a]/80">
                  {row.morningOut || "—"}
                </td>
                <td className="py-1.5 pr-2 tabular-nums text-[#1e2a4a]/80">
                  {row.afternoonIn || "—"}
                </td>
                <td className="py-1.5 pr-2 tabular-nums text-[#1e2a4a]/80">
                  {row.afternoonOut || "—"}
                </td>
                <td className="py-1.5 text-[#1e2a4a]/80">
                  {row.status || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dateLabel ? (
        <p className="text-[9px] text-[#1e2a4a]/45">
          Service date: {dateLabel}
        </p>
      ) : null}
    </div>
  )
}

export { AttendanceReport }
export default AttendanceReport
