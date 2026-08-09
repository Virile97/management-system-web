import { ERROR_MESSAGES } from "@/utils/errors"

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
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }

    throw new Error(ERROR_MESSAGES.GENERIC)
  }

  if (res.status === 429) {
    throw new Error(ERROR_MESSAGES.RATE_LIMITED)
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

/**
 * Wraps a retriable async function (e.g. a service call) so failures are
 * retried silently in the background, up to `maxAttempts` total tries.
 * Only the final failure is thrown/surfaced — callers don't see the
 * intermediate ones, so the UI doesn't flash an error on every retry.
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
      if (err?.name === "AbortError") throw err

      lastError = err
    }
  }

  throw lastError
}

export { fetchJson, fetchWithMeta, withRetry }
