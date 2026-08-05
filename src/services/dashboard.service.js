import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getStats(signal) {
  return fetchJson(APP_API_ENDPOINTS.DASHBOARD_STATS, { signal })
}

function getMemberBreakdown(signal) {
  return fetchJson(APP_API_ENDPOINTS.DASHBOARD_MEMBER_BREAKDOWN, { signal })
}

function getFinanceSummary(range = "6m", signal) {
  return fetchJson(`${APP_API_ENDPOINTS.DASHBOARD_FINANCE_SUMMARY}?range=${range}`, { signal })
}

function getRecentActivity(limit = 5, signal) {
  return fetchJson(`${APP_API_ENDPOINTS.DASHBOARD_RECENT_ACTIVITY}?limit=${limit}`, { signal })
}

export { getStats, getMemberBreakdown, getFinanceSummary, getRecentActivity }
