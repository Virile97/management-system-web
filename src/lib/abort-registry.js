/**
 * Tracks every AbortController backing an in-flight authenticated fetch, so
 * logout can cancel all of them before clearing the session.
 *
 * Why this exists: middleware renews (re-Set-Cookies) the auth_token cookie
 * on every authenticated GET. If a page's data fetch is still in flight when
 * the user logs out, that stale request's response can land in the browser
 * *after* logout's cookie-clearing response — and its middleware-renewed
 * Set-Cookie resurrects a valid session, undoing the logout. Aborting every
 * registered controller before calling the logout endpoint closes that race:
 * an aborted request never completes, so it can never carry a stale
 * Set-Cookie back to the browser.
 */
const controllers = new Set()

function register(controller) {
  controllers.add(controller)
  return () => controllers.delete(controller)
}

function abortAll() {
  for (const controller of controllers) {
    controller.abort()
  }
  controllers.clear()
}

export { register, abortAll }
