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
 * Renews the auth_user and csrf_token cookies' sliding maxAge on a
 * successful /auth/refresh. auth_user is rewritten from the backend's own
 * refresh response (the source of truth) rather than echoed from the
 * incoming request, since the whole point of calling this is that the
 * browser's copy may have already expired by the time refresh runs — in
 * that case there'd be nothing to "renew" from the request alone. csrf_token
 * has no backend equivalent, so it's just carried forward if present.
 *
 * Mirrors what middleware does on every matched request — but /auth/refresh
 * itself isn't in the middleware matcher, so without this, these two cookies
 * would keep expiring on their original 24h clock independent of the (now
 * fresh) access token.
 */
function renewSiblingCookies(response, request, { user } = {}) {
  const common = { ...baseCookieOptions(), maxAge: AUTH_SESSION_MAX_AGE }

  if (user)
    response.cookies.set(AUTH_USER_COOKIE_NAME, JSON.stringify(user), {
      ...common,
      httpOnly: false,
    })

  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (csrfToken)
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      ...common,
      httpOnly: false,
    })
}

/**
 * Relays the backend's own Set-Cookie header (its httpOnly refresh-token
 * cookie) from an axios response onto our Next.js response, so it reaches
 * the browser and is sent back to the backend on the next /auth/refresh
 * call. We never parse or name this cookie — it's opaque to this app.
 */
function forwardBackendSetCookie(response, axiosResponse) {
  const raw = axiosResponse.headers?.["set-cookie"]
  if (!raw) return

  const cookies = Array.isArray(raw) ? raw : [raw]
  for (const cookie of cookies) {
    response.headers.append("Set-Cookie", cookie)
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
