import { cookies } from "next/headers"

import {
  AUTH_TOKEN_COOKIE_NAME,
  AUTH_USER_COOKIE_NAME,
  AUTH_SESSION_ABSOLUTE_MAX_AGE,
  AUTH_SESSION_MAX_AGE,
  CSRF_COOKIE_NAME,
} from "@/utils/constants"

function baseCookieOptions() {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  }
}

function generateCsrfToken() {
  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)

  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Writes the full session (token, user, loginAt, csrf) onto a response's cookies.
 * Used at login. `maxAge` controls the sliding-expiry cookie lifetime; `loginAt`
 * is preserved across renewals so the absolute cap can be enforced independently.
 */
function setSessionCookies(response, { token, user, loginAt = Date.now() }) {
  const common = baseCookieOptions()

  response.cookies.set(
    AUTH_TOKEN_COOKIE_NAME,
    JSON.stringify({ token, loginAt }),
    { ...common, httpOnly: true, maxAge: AUTH_SESSION_MAX_AGE }
  )

  response.cookies.set(AUTH_USER_COOKIE_NAME, JSON.stringify(user), {
    ...common,
    httpOnly: false,
    maxAge: AUTH_SESSION_MAX_AGE,
  })

  response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
    ...common,
    httpOnly: false,
    maxAge: AUTH_SESSION_MAX_AGE,
  })
}

function clearSessionCookies(response) {
  response.cookies.delete(AUTH_TOKEN_COOKIE_NAME)
  response.cookies.delete(AUTH_USER_COOKIE_NAME)
  response.cookies.delete(CSRF_COOKIE_NAME)
}

/**
 * Validates the raw auth_token cookie value against the absolute session cap.
 * Returns the parsed { token, loginAt } if still within the cap, or null otherwise.
 */
function readValidTokenCookie(rawValue) {
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(rawValue)
    if (!parsed?.token || !parsed?.loginAt) return null

    const ageSeconds = (Date.now() - parsed.loginAt) / 1000
    if (ageSeconds > AUTH_SESSION_ABSOLUTE_MAX_AGE) return null

    return parsed
  } catch {
    return null
  }
}

/**
 * Reads the current request's session token (via next/headers cookies()).
 * For use inside route handlers that need to call the backend as the signed-in user.
 * Returns null if there's no session or it's past the absolute cap.
 */
function getSessionToken() {
  const raw = cookies().get(AUTH_TOKEN_COOKIE_NAME)?.value

  return readValidTokenCookie(raw)?.token ?? null
}

export {
  baseCookieOptions,
  setSessionCookies,
  clearSessionCookies,
  readValidTokenCookie,
  getSessionToken,
}
