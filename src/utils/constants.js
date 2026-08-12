const API_V1 = "/api/v1"

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_V1}/auth/login`,
  AUTH_LOGOUT: `${API_V1}/auth/logout`,
  AUTH_REFRESH: `${API_V1}/auth/refresh`,
  AUTH_PUBLIC_KEY: `${API_V1}/auth/public-key`,

  // Dashboard
  DASHBOARD_STATS: `${API_V1}/dashboard/stats`,
  DASHBOARD_FINANCE_SUMMARY: `${API_V1}/dashboard/finance-summary`,
  DASHBOARD_RECENT_ACTIVITY: `${API_V1}/dashboard/recent-activity`,
  DASHBOARD_MEMBER_BREAKDOWN: `${API_V1}/dashboard/member-breakdown`,
  DASHBOARD_ATTENDANCE_SUMMARY: `${API_V1}/dashboard/attendance-summary`,

  // Users
  USERS: `${API_V1}/users`,
  USER_BY_ID: (id) => `${API_V1}/users/${id}`,

  // Members
  MEMBERS: `${API_V1}/members`,
  MEMBERS_CONFIG: `${API_V1}/members/config`,
  MEMBERS_BREAKDOWN: `${API_V1}/members/breakdown`,
  MEMBER_BY_ID: (id) => `${API_V1}/members/${id}`,
  MEMBER_OFFERINGS: (id) => `${API_V1}/members/${id}/offerings`,
  MEMBERS_BULK_DELETE: `${API_V1}/members/bulk-delete`,

  // Finances
  TRANSACTIONS: `${API_V1}/transactions`,
  TRANSACTIONS_TREND: `${API_V1}/transactions/trend`,
  TRANSACTIONS_STATS: `${API_V1}/transactions/stats`,
  TRANSACTION_BY_ID: (id) => `${API_V1}/transactions/${id}`,
  TRANSACTIONS_BY_OFFERING_TYPE: `${API_V1}/transactions/by-offering-type`,
  TRANSACTIONS_BULK_DELETE: `${API_V1}/transactions/bulk-delete`,
  TRANSACTIONS_CONFIG: `${API_V1}/transactions/config`,

  // Attendance
  ATTENDANCE: `${API_V1}/attendance`,
  ATTENDANCE_BY_MEMBER: (memberId) => `${API_V1}/attendance/${memberId}`,
}

export const APP_API_ENDPOINTS = {
  // Auth
  AUTH_ME: "/api/auth/me",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_PUBLIC_KEY: "/api/auth/public-key",

  // Dashboard
  DASHBOARD_STATS: "/api/dashboard",
  DASHBOARD_FINANCE_SUMMARY: "/api/dashboard/finance-summary",
  DASHBOARD_RECENT_ACTIVITY: "/api/dashboard/recent-activity",
  DASHBOARD_MEMBER_BREAKDOWN: "/api/dashboard/member-breakdown",
  DASHBOARD_ATTENDANCE_SUMMARY: "/api/dashboard/attendance-summary",

  // Users
  USERS: "/api/users",
  USER_BY_ID: (id) => `/api/users/${id}`,

  // Members
  MEMBERS: "/api/members",
  MEMBERS_CONFIG: "/api/members/config",
  MEMBERS_BREAKDOWN: "/api/members/breakdown",
  MEMBER_BY_ID: (id) => `/api/members/${id}`,
  MEMBER_OFFERINGS: (id) => `/api/members/${id}/offerings`,
  MEMBERS_BULK_DELETE: "/api/members/bulk-delete",
  MEMBERS_FINANCE_ACCESS: "/api/members/finance-access",

  // Finances
  TRANSACTIONS: "/api/finances",
  TRANSACTIONS_STATS: "/api/finances/stats",
  TRANSACTIONS_TREND: "/api/finances/trend",
  TRANSACTION_BY_ID: (id) => `/api/finances/${id}`,
  TRANSACTIONS_BY_OFFERING_TYPE: "/api/finances/by-offering-type",
  TRANSACTIONS_BULK_DELETE: "/api/finances/bulk-delete",
  TRANSACTIONS_CONFIG: "/api/finances/config",

  // Attendance
  ATTENDANCE: "/api/attendance",
  ATTENDANCE_BY_MEMBER: (memberId) => `/api/attendance/${memberId}`,
}

/**
 * auth_user: non-httpOnly, contains { id, email, name, role }.
 * auth_token: httpOnly JWT used for backend Authorization.
 * csrf_token: non-httpOnly token sent as X-CSRF-Token on mutating /api/* requests.
 *
 * The backend's refresh-token cookie is httpOnly and opaque to this app.
 * Login/refresh handlers must forward its Set-Cookie header to the browser.
 */
export const CSRF_COOKIE_NAME = "csrf_token"
export const CSRF_HEADER_NAME = "x-csrf-token"
export const AUTH_USER_COOKIE_NAME = "auth_user"
export const AUTH_TOKEN_COOKIE_NAME = "auth_token"

export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24
export const AUTH_SESSION_ABSOLUTE_MAX_AGE = 60 * 60 * 24 * 7

export const OFFERING_CATEGORIES = [
  "Tithes",
  "Love",
  "Faith",
  "Christbirth",
  "Firstfruit",
  "Sacrificial",
  "Thanksgiving",
]

export const OTHER_OFFERING_CATEGORIES = [
  "Bless Offering",
  "Children's Ministry",
  "Ensemble",
  "GCTV",
  "Mission",
  "Mercy",
  "Love Gift – Pastor",
]
