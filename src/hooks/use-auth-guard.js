import { useEffect } from "react"

import { getCurrentUser } from "@/lib/auth"
import { refreshSession } from "@/services/api"

/**
 * Redirects when the client-side session state doesn't match what the
 * current page expects. Runs on mount and again on `pageshow`/`visibilitychange`
 * so it catches browser back/forward restoring a page from bfcache, which
 * bypasses middleware entirely (no request is sent to the server).
 *
 * `auth_user` is a convenience cookie renewed opportunistically by middleware
 * on matched requests — it can lapse (e.g. after a long idle tab) well before
 * the access/refresh tokens actually do. When it's missing we attempt one
 * silent refresh (httpOnly refreshToken) before deciding:
 * - authenticated pages → stay if refresh restores the session, else /login
 * - guest pages → auto-login to `redirectTo` if refresh succeeds
 *
 * @param {"authenticated" | "guest"} require - session state this page needs
 * @param {string} redirectTo - where to send the user if the check fails
 */
function useAuthGuard(require, redirectTo) {
  useEffect(() => {
    let cancelled = false

    async function check() {
      if (getCurrentUser()) {
        if (require === "guest") window.location.replace(redirectTo)
        return
      }

      const refreshed = await refreshSession()
      if (cancelled) return

      if (refreshed && getCurrentUser()) {
        if (require === "guest") window.location.replace(redirectTo)
        return
      }

      if (require === "guest") return

      window.location.replace(redirectTo)
    }

    check()
    document.addEventListener("visibilitychange", check)
    window.addEventListener("pageshow", check)

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", check)
      window.removeEventListener("pageshow", check)
    }
  }, [require, redirectTo])
}

export { useAuthGuard }
export default useAuthGuard
