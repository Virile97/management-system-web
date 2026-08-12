import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getStats(signal) {
  return fetchJson(APP_API_ENDPOINTS.DASHBOARD_STATS, { signal })
}

function getMemberBreakdown(signal) {
  return fetchJson(APP_API_ENDPOINTS.DASHBOARD_MEMBER_BREAKDOWN, { signal })
}

function getFinanceSummary(range = "6m", signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.DASHBOARD_FINANCE_SUMMARY}?range=${range}`,
    { signal }
  )
}

function getRecentActivity(limit = 5, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.DASHBOARD_RECENT_ACTIVITY}?limit=${limit}`,
    { signal }
  )
}

/**
 * Weekly attendance rates for the Member Attendance chart.
 * Maps API `{ label, percentage }` points onto `{ date, rate }` for AttendanceChart.
 */
function normalizeAttendanceSummary(points = []) {
  return (Array.isArray(points) ? points : []).map((point) => ({
    date: point.label || "—",
    rate: Number(point.percentage ?? 0),
  }))
}

function getAttendanceSummary(range = "5w", signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.DASHBOARD_ATTENDANCE_SUMMARY}?range=${range}`,
    {
      signal,
    }
  ).then(normalizeAttendanceSummary)
}

export {
  getStats,
  getMemberBreakdown,
  getFinanceSummary,
  getRecentActivity,
  getAttendanceSummary,
}
