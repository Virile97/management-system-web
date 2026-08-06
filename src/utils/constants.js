const API_V1 = "/api/v1"

// Backend endpoints, called server-side (via lib/axios.js) from our own /api/auth/* route handlers
export const API_ENDPOINTS = {
  AUTH_PUBLIC_KEY: `${API_V1}/auth/public-key`,
  AUTH_LOGIN: `${API_V1}/auth/login`,
  AUTH_LOGOUT: `${API_V1}/auth/logout`,
  DASHBOARD_STATS: `${API_V1}/dashboard/stats`,
  DASHBOARD_MEMBER_BREAKDOWN: `${API_V1}/dashboard/member-breakdown`,
  DASHBOARD_FINANCE_SUMMARY: `${API_V1}/dashboard/finance-summary`,
  DASHBOARD_RECENT_ACTIVITY: `${API_V1}/dashboard/recent-activity`,
  USERS: `${API_V1}/users`,
  USER_BY_ID: (id) => `${API_V1}/users/${id}`,
  MEMBERS: `${API_V1}/members`,
  MEMBERS_CONFIG: `${API_V1}/members/config`,
}

// Our own Next.js route handlers, called client-side (via fetch in components)
export const APP_API_ENDPOINTS = {
  AUTH_PUBLIC_KEY: "/api/auth/public-key",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_ME: "/api/auth/me",
  DASHBOARD_STATS: "/api/dashboard",
  DASHBOARD_MEMBER_BREAKDOWN: "/api/dashboard/member-breakdown",
  DASHBOARD_FINANCE_SUMMARY: "/api/dashboard/finance-summary",
  DASHBOARD_RECENT_ACTIVITY: "/api/dashboard/recent-activity",
  USERS: "/api/users",
  USER_BY_ID: (id) => `/api/users/${id}`,
  MEMBERS: "/api/members",
  MEMBERS_CONFIG: "/api/members/config",
}

// auth_user: non-httpOnly, holds { id, email, name, role } — safe for client JS to read (no secret)
// auth_token: httpOnly, holds the raw JWT used as the Authorization bearer token against the backend
// csrf_token: non-httpOnly, double-submitted as the X-CSRF-Token header on mutating /api/* requests
export const AUTH_USER_COOKIE_NAME = "auth_user"
export const AUTH_TOKEN_COOKIE_NAME = "auth_token"
export const CSRF_COOKIE_NAME = "csrf_token"
export const CSRF_HEADER_NAME = "x-csrf-token"

export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours, slides forward on each authenticated request
export const AUTH_SESSION_ABSOLUTE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, hard cap regardless of activity
