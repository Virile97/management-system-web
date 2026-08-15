const API_V1 = "/api/v1"

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: `${API_V1}/auth/login`,
  AUTH_LOGOUT: `${API_V1}/auth/logout`,
  AUTH_REFRESH: `${API_V1}/auth/refresh`,
  AUTH_PUBLIC_KEY: `${API_V1}/auth/public-key`,
  AUTH_SET_PASSWORD: `${API_V1}/auth/set-password`,

  // Dashboard
  DASHBOARD: `${API_V1}/dashboard`,
  DASHBOARD_ACTIVITY: `${API_V1}/dashboard/activity`,

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

  // Soul Winning
  SOUL_WINNING_OVERVIEW: `${API_V1}/soul-winning/overview`,
  SOUL_WINNING_GOALS: `${API_V1}/soul-winning/goals`,
  SOUL_WINNING_RECORDS: `${API_V1}/soul-winning/records`,
  SOUL_WINNING_RECORD_BY_ID: (id) => `${API_V1}/soul-winning/records/${id}`,
  SOUL_WINNING_BAPTIZE: (id) => `${API_V1}/soul-winning/records/${id}/baptize`,
  SOUL_WINNING_WINNERS: `${API_V1}/soul-winning/winners`,
  SOUL_WINNING_TRENDS: `${API_V1}/soul-winning/trends`,

  // New Believers
  NEW_BELIEVERS_OVERVIEW: `${API_V1}/new-believers/overview`,
  NEW_BELIEVERS_LESSONS: `${API_V1}/new-believers/lessons`,
  NEW_BELIEVERS_LESSON_BY_ID: (id) => `${API_V1}/new-believers/lessons/${id}`,
  NEW_BELIEVERS_ENROLLMENTS: `${API_V1}/new-believers/enrollments`,
  NEW_BELIEVERS_ENROLLMENT_MOVE: (id) =>
    `${API_V1}/new-believers/enrollments/${id}/move`,
  NEW_BELIEVERS_ENROLLMENT_BY_ID: (id) =>
    `${API_V1}/new-believers/enrollments/${id}`,
  NEW_BELIEVERS_ASSIGNABLE_STUDENTS: `${API_V1}/new-believers/assignable-students`,
  NEW_BELIEVERS_MEMBER_JOURNEY: (memberId) =>
    `${API_V1}/new-believers/journey/${memberId}`,

  // File Storage
  FILE_STORAGE_STATS: `${API_V1}/file-storage/stats`,
  FILE_STORAGE_LIST: `${API_V1}/file-storage`,
  FILE_STORAGE_UPLOAD: `${API_V1}/file-storage/upload`,
  FILE_STORAGE_DOWNLOAD: (id) => `${API_V1}/file-storage/${id}/download`,
  FILE_STORAGE_BY_ID: (id) => `${API_V1}/file-storage/${id}`,
  FILE_STORAGE_MOVE: (id) => `${API_V1}/file-storage/${id}/move`,
  FILE_STORAGE_FOLDERS: `${API_V1}/file-storage/folders`,
  FILE_STORAGE_FOLDER_BY_ID: (id) => `${API_V1}/file-storage/folders/${id}`,
  FILE_STORAGE_FOLDER_BREADCRUMB: (id) =>
    `${API_V1}/file-storage/folders/${id}/breadcrumb`,
}

export const APP_API_ENDPOINTS = {
  // Auth
  AUTH_ME: "/api/auth/me",
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_PUBLIC_KEY: "/api/auth/public-key",
  AUTH_SET_PASSWORD: "/api/auth/set-password",

  // Dashboard
  DASHBOARD: "/api/dashboard",
  DASHBOARD_ACTIVITY: "/api/dashboard/activity",

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

  // Soul Winning
  SOUL_WINNING_OVERVIEW: "/api/soul-winning/overview",
  SOUL_WINNING_GOALS: "/api/soul-winning/goals",
  SOUL_WINNING_RECORDS: "/api/soul-winning/records",
  SOUL_WINNING_RECORD_BY_ID: (id) => `/api/soul-winning/records/${id}`,
  SOUL_WINNING_BAPTIZE: (id) => `/api/soul-winning/records/${id}/baptize`,
  SOUL_WINNING_WINNERS: "/api/soul-winning/winners",
  SOUL_WINNING_TRENDS: "/api/soul-winning/trends",

  // New Believers
  NEW_BELIEVERS_OVERVIEW: "/api/new-believers/overview",
  NEW_BELIEVERS_LESSONS: "/api/new-believers/lessons",
  NEW_BELIEVERS_LESSON_BY_ID: (id) => `/api/new-believers/lessons/${id}`,
  NEW_BELIEVERS_ENROLLMENTS: "/api/new-believers/enrollments",
  NEW_BELIEVERS_ENROLLMENT_MOVE: (id) =>
    `/api/new-believers/enrollments/${id}/move`,
  NEW_BELIEVERS_ENROLLMENT_BY_ID: (id) =>
    `/api/new-believers/enrollments/${id}`,
  NEW_BELIEVERS_ASSIGNABLE_STUDENTS: "/api/new-believers/assignable-students",
  NEW_BELIEVERS_MEMBER_JOURNEY: (memberId) =>
    `/api/new-believers/journey/${memberId}`,

  // File Storage
  FILE_STORAGE_STATS: "/api/file-storage/stats",
  FILE_STORAGE_LIST: "/api/file-storage",
  FILE_STORAGE_UPLOAD: "/api/file-storage/upload",
  FILE_STORAGE_DOWNLOAD: (id) => `/api/file-storage/${id}/download`,
  FILE_STORAGE_BY_ID: (id) => `/api/file-storage/${id}`,
  FILE_STORAGE_MOVE: (id) => `/api/file-storage/${id}/move`,
  FILE_STORAGE_FOLDERS: "/api/file-storage/folders",
  FILE_STORAGE_FOLDER_BY_ID: (id) => `/api/file-storage/folders/${id}`,
  FILE_STORAGE_FOLDER_BREADCRUMB: (id) =>
    `/api/file-storage/folders/${id}/breadcrumb`,
}

/**
 * auth_user: non-httpOnly, contains { id, email, name, role }.
 * auth_token: httpOnly JWT used for backend Authorization.
 * csrf_token: non-httpOnly token sent as X-CSRF-Token on mutating /api/* requests.
 *
 * The backend's refresh-token cookie is httpOnly. Login/refresh handlers
 * forward its Set-Cookie to the browser with Path rewritten to
 * REFRESH_TOKEN_COOKIE_PATH so `/api/auth/refresh` actually receives it.
 */
export const CSRF_COOKIE_NAME = "csrf_token"
export const CSRF_HEADER_NAME = "x-csrf-token"
export const AUTH_USER_COOKIE_NAME = "auth_user"
export const AUTH_TOKEN_COOKIE_NAME = "auth_token"
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken"
/** BFF path prefix — must match where we call refresh/logout. */
export const REFRESH_TOKEN_COOKIE_PATH = "/api/auth"

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

/** Shared table page-size choices across list/table views. */
export const PAGE_SIZE_OPTIONS = [20, 50, 100]
export const DEFAULT_PAGE_SIZE = 20

/** Preset event labels for Record Soul Won (creatable beyond this list). */
export const SOUL_WINNING_EVENT_OPTIONS = [
  "Personal Soul Winning",
  "Pre-Anniversary",
  "New Life",
  "Men's Fellowship",
  "Feeding program",
  "Summer Youth Camp",
  "Birthday",
  "Mothers' Sunday",
  "Father's Sunday",
  "Funeral Service",
]

export function resolvePageSize(
  value,
  { options = PAGE_SIZE_OPTIONS, fallback = DEFAULT_PAGE_SIZE } = {}
) {
  const size = Number(value)
  return options.includes(size) ? size : fallback
}
