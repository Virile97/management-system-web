import { ERROR_MESSAGES } from "@/utils/errors"
import { getCurrentUser } from "@/lib/auth"

async function fetchWithMeta(url, options) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error(ERROR_MESSAGES.OFFLINE)
  }

  let res
  try {
    res = await fetch(url, options)
  } catch {
    throw new Error(ERROR_MESSAGES.OFFLINE)
  }

  if (res.status === 401) {
    const body = await res.json().catch(() => null)
    const isTokenInvalid = /invalid|expired/i.test(body?.message ?? "")

    if (isTokenInvalid && typeof window !== "undefined") {
      // The backend has explicitly rejected this token — there is no
      // refresh-token flow to fall back to (see /api/auth/refresh, a 501
      // stub), so the only correct move is to log out: clear the session
      // (httpOnly cookie included, hence going through the logout route
      // rather than deleting client-side) and send the user to sign in
      // again instead of leaving them stuck on a page that can't recover.
      // Awaited (not fire-and-forget) so the redirect can't race the cookie
      // being cleared, and thrown as a distinctly-named error so withRetry
      // doesn't burn attempts retrying a session that's already dead.
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
      window.location.href = "/login"

      const err = new Error(ERROR_MESSAGES.GENERIC)
      err.name = "SessionExpiredError"
      throw err
    }

    // Otherwise, only redirect if the client-side session is actually gone
    // too — a 401 from one endpoint while auth_user is still present is a
    // false/transient signal (e.g. the backend itself degrading under
    // load), not a real logout. Redirecting anyway sends the browser to
    // /login while session cookies are still valid, middleware immediately
    // bounces it back to the dashboard, which re-fetches and 401s again —
    // a full-page reload loop that hammers the backend until it starts
    // rate-limiting.
    if (typeof window !== "undefined" && !getCurrentUser()) {
      window.location.href = "/login"
    }

    throw new Error(body?.message || ERROR_MESSAGES.GENERIC)
  }

  if (res.status === 429) {
    const err = new Error(ERROR_MESSAGES.RATE_LIMITED)
    err.name = "RateLimitError"
    throw err
  }

  if (res.status === 204) {
    if (!res.ok) throw new Error(ERROR_MESSAGES.GENERIC)

    return { data: null, meta: undefined }
  }

  let body
  try {
    body = await res.json()
  } catch {
    throw new Error(ERROR_MESSAGES.GENERIC)
  }

  if (!res.ok || !body.success) {
    throw new Error(body.message || ERROR_MESSAGES.GENERIC)
  }

  return { data: body.data, meta: body.meta }
}

async function fetchJson(url, options) {
  const { data } = await fetchWithMeta(url, options)
  return data
}

const DEFAULT_MAX_ATTEMPTS = 5
const BASE_DELAY_MS = 300
const MAX_DELAY_MS = 4000

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)

    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    }, { once: true })
  })
}

/**
 * Wraps a retriable async function (e.g. a service call) so failures are
 * retried silently in the background, up to `maxAttempts` total tries, with
 * exponential backoff + jitter between attempts. Only the final failure is
 * thrown/surfaced — callers don't see the intermediate ones, so the UI
 * doesn't flash an error on every retry.
 *
 * A 429 (RateLimitError) is never retried: hammering an endpoint that's
 * already rate-limiting the client is exactly what keeps it rate-limited,
 * especially with several parallel fetchers each retrying independently.
 * That failure surfaces immediately instead.
 *
 * `fn` receives the current attempt number (1-based) and must accept an
 * AbortSignal as its last argument if it's abortable. Retries stop early
 * if the signal is already aborted.
 */
async function withRetry(fn, { maxAttempts = DEFAULT_MAX_ATTEMPTS, signal } = {}) {
  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }

    try {
      return await fn(attempt)
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "RateLimitError" || err?.name === "SessionExpiredError") {
        throw err
      }

      lastError = err

      if (attempt < maxAttempts) {
        const backoff = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1))
        const jitter = Math.random() * backoff * 0.5

        await sleep(backoff + jitter, signal)
      }
    }
  }

  throw lastError
}

export { fetchJson, fetchWithMeta, withRetry }
