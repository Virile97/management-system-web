import { useEffect } from "react"

import { getCurrentUser } from "@/lib/auth"

/**
 * Redirects when the client-side session state doesn't match what the
 * current page expects. Runs on mount and again on `pageshow`/`visibilitychange`
 * so it catches browser back/forward restoring a page from bfcache, which
 * bypasses middleware entirely (no request is sent to the server).
 *
 * @param {"authenticated" | "guest"} require - session state this page needs
 * @param {string} redirectTo - where to send the user if the check fails
 */
function useAuthGuard(require, redirectTo) {
  useEffect(() => {
    function check() {
      const isAuthenticated = Boolean(getCurrentUser())
      const satisfied = require === "authenticated" ? isAuthenticated : !isAuthenticated

      if (!satisfied) window.location.replace(redirectTo)
    }

    check()
    document.addEventListener("visibilitychange", check)
    window.addEventListener("pageshow", check)

    return () => {
      document.removeEventListener("visibilitychange", check)
      window.removeEventListener("pageshow", check)
    }
  }, [require, redirectTo])
}

export { useAuthGuard }
export default useAuthGuard
