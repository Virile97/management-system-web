import { cookies } from "next/headers"

import {
  AUTH_TOKEN_COOKIE_NAME,
  AUTH_USER_COOKIE_NAME,
  AUTH_SESSION_ABSOLUTE_MAX_AGE,
  AUTH_SESSION_MAX_AGE,
  CSRF_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
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
  // Must match Path used when we relayed the backend refresh cookie, or the
  // browser keeps a stale refreshToken and the next "silent login" succeeds.
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
    ...baseCookieOptions(),
    httpOnly: true,
    path: REFRESH_TOKEN_COOKIE_PATH,
    maxAge: 0,
  })
}


/**
 * Updates just the access token half of the session (after a successful
 * /auth/refresh), preserving the original loginAt so the absolute session
 * cap keeps counting from first login rather than resetting on refresh.
 */
function setAccessTokenCookie(response, { token, loginAt }) {
  response.cookies.set(
    AUTH_TOKEN_COOKIE_NAME,
    JSON.stringify({ token, loginAt }),
    { ...baseCookieOptions(), httpOnly: true, maxAge: AUTH_SESSION_MAX_AGE }
  )
}

/**
 * Renews auth_user / csrf_token on a successful /auth/refresh.
 * auth_user comes from the backend refresh payload (source of truth).
 * csrf is carried forward when present, otherwise minted fresh — long-idle
 * tabs often lose csrf before the refresh token expires.
 *
 * /auth/refresh is outside the middleware matcher, so this must renew these
 * cookies explicitly or they keep expiring on their original 24h clock.
 */
function renewSiblingCookies(response, request, { user } = {}) {
  const common = { ...baseCookieOptions(), maxAge: AUTH_SESSION_MAX_AGE }

  if (user)
    response.cookies.set(AUTH_USER_COOKIE_NAME, JSON.stringify(user), {
      ...common,
      httpOnly: false,
    })

  // After a long idle the csrf cookie may already be gone — mint a fresh one
  // so mutating requests work immediately after silent refresh / auto-login.
  const csrfToken =
    request.cookies.get(CSRF_COOKIE_NAME)?.value || generateCsrfToken()
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    ...common,
    httpOnly: false,
  })
}

/**
 * Relays the backend's httpOnly refresh-token Set-Cookie onto our response.
 *
 * The backend scopes Path to `/api/v1/auth` (its own mount). Relayed as-is,
 * the browser would never send that cookie to our BFF (`/api/auth/refresh`),
 * so silent refresh / auto-login always fails. Rewrite Path to the BFF auth
 * prefix and drop Domain so the cookie is bound to this app's origin.
 */
function rewriteBackendRefreshCookie(cookie) {
  let next = String(cookie).replace(/;\s*Domain=[^;]*/gi, "")

  if (/;\s*Path=/i.test(next)) {
    next = next.replace(
      /;\s*Path=[^;]*/i,
      `; Path=${REFRESH_TOKEN_COOKIE_PATH}`
    )
  } else {
    next = `${next}; Path=${REFRESH_TOKEN_COOKIE_PATH}`
  }

  return next
}

function forwardBackendSetCookie(response, axiosResponse) {
  const raw =
    axiosResponse.headers?.["set-cookie"] ??
    axiosResponse.headers?.getSetCookie?.()
  if (!raw) return

  const cookies = Array.isArray(raw) ? raw : [raw]
  for (const cookie of cookies) {
    response.headers.append("Set-Cookie", rewriteBackendRefreshCookie(cookie))
  }
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

/**
 * Reads the current request's original loginAt, so a refresh can carry it
 * forward instead of resetting the absolute session cap.
 */
function getSessionLoginAt() {
  const raw = cookies().get(AUTH_TOKEN_COOKIE_NAME)?.value

  return readValidTokenCookie(raw)?.loginAt ?? null
}

export {
  baseCookieOptions,
  setSessionCookies,
  clearSessionCookies,
  setAccessTokenCookie,
  renewSiblingCookies,
  forwardBackendSetCookie,
  readValidTokenCookie,
  getSessionToken,
  getSessionLoginAt,
}
