const API_V1 = "/api/v1"

export const API_ENDPOINTS = {
  //Auth endpoints
  AUTH_LOGIN: `${API_V1}/auth/login`,
  AUTH_LOGOUT: `${API_V1}/auth/logout`,
  AUTH_REFRESH: `${API_V1}/auth/refresh`,
  AUTH_PUBLIC_KEY: `${API_V1}/auth/public-key`,

  // Dashboard endpoints
  DASHBOARD_STATS: `${API_V1}/dashboard/stats`,
  DASHBOARD_FINANCE_SUMMARY: `${API_V1}/dashboard/finance-summary`,
  DASHBOARD_RECENT_ACTIVITY: `${API_V1}/dashboard/recent-activity`,
  DASHBOARD_MEMBER_BREAKDOWN: `${API_V1}/dashboard/member-breakdown`,

  // Users endpoints
  USERS: `${API_V1}/users`,
  USER_BY_ID: (id) => `${API_V1}/users/${id}`,

  // Members endpoints
  MEMBERS: `${API_V1}/members`,
  MEMBERS_CONFIG: `${API_V1}/members/config`,
  MEMBER_BY_ID: (id) => `${API_V1}/members/${id}`,
  MEMBERS_BULK_DELETE: `${API_V1}/members/bulk-delete`,

  // Finances endpoints
  TRANSACTIONS: `${API_V1}/transactions`,
  TRANSACTIONS_TREND: `${API_V1}/transactions/trend`,
  TRANSACTIONS_STATS: `${API_V1}/transactions/stats`,
  TRANSACTION_BY_ID: (id) => `${API_V1}/transactions/${id}`,
  TRANSACTIONS_BY_CATEGORY: `${API_V1}/transactions/by-category`,
  TRANSACTIONS_BULK_DELETE: `${API_V1}/transactions/bulk-delete`,
}

export const APP_API_ENDPOINTS = {
  // App Auth endpoints
  AUTH_ME: "/api/auth/me",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_PUBLIC_KEY: "/api/auth/public-key",

  // App Dashboard endpoints
  DASHBOARD_STATS: "/api/dashboard",
  DASHBOARD_FINANCE_SUMMARY: "/api/dashboard/finance-summary",
  DASHBOARD_RECENT_ACTIVITY: "/api/dashboard/recent-activity",
  DASHBOARD_MEMBER_BREAKDOWN: "/api/dashboard/member-breakdown",

  // App Users endpoints
  USERS: "/api/users",
  USER_BY_ID: (id) => `/api/users/${id}`,

  // App Members endpoints
  MEMBERS: "/api/members",
  MEMBERS_CONFIG: "/api/members/config",
  MEMBER_BY_ID: (id) => `/api/members/${id}`,
  MEMBERS_BULK_DELETE: "/api/members/bulk-delete",

  // App Finances endpoints
  TRANSACTIONS: "/api/finances",
  TRANSACTIONS_STATS: "/api/finances/stats",
  TRANSACTIONS_TREND: "/api/finances/trend",
  TRANSACTION_BY_ID: (id) => `/api/finances/${id}`,
  TRANSACTIONS_BY_CATEGORY: "/api/finances/by-category",
  TRANSACTIONS_BULK_DELETE: "/api/finances/bulk-delete",
}

/**
 * auth_user: non-httpOnly, holds { id, email, name, role } — safe for client JS to read (no secret)
 * auth_token: httpOnly, holds the raw JWT used as the Authorization bearer token against the backend
 * csrf_token: non-httpOnly, double-submitted as the X-CSRF-Token header on mutating /api/* requests
 *
 * The backend also sets its own httpOnly refresh-token cookie directly via Set-Cookie on
 * /auth/login and /auth/refresh responses. This app never reads or names that cookie — it's
 * opaque to us — but login/refresh route handlers must forward the backend's Set-Cookie header
 * onto the browser response so it round-trips back to the backend on the next refresh call.
 */
export const CSRF_COOKIE_NAME = "csrf_token"
export const CSRF_HEADER_NAME = "x-csrf-token"
export const AUTH_USER_COOKIE_NAME = "auth_user"
export const AUTH_TOKEN_COOKIE_NAME = "auth_token"

export const AUTH_SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours, slides forward on each authenticated request
export const AUTH_SESSION_ABSOLUTE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, hard cap regardless of activity
