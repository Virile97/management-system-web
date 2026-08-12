import { NextResponse } from "next/server"

import {
  baseCookieOptions,
  clearSessionCookies,
  readValidTokenCookie,
} from "@/lib/session"
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  AUTH_SESSION_MAX_AGE,
  AUTH_USER_COOKIE_NAME,
  AUTH_TOKEN_COOKIE_NAME,
} from "@/utils/constants"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])
const CSRF_EXEMPT_PATHS = new Set(["/api/auth/login", "/api/auth/logout"])

// Routes the plain USER role cannot view; they're bounced to /members instead.
const RESTRICTED_FOR_USER_ROLE = [
  "/dashboard",
  "/attendance",
  "/finances",
  "/soul-winning",
  "/settings",
]

export function middleware(request) {
  const tokenSession = readValidTokenCookie(
    request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value
  )
  const hasSession = Boolean(tokenSession)
  const isGuestAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/set-password"

  if (isGuestAuthPage) {
    if (!hasSession) {
      const response = NextResponse.next()
      response.headers.set("Cache-Control", "no-store, must-revalidate")

      return response
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url))
    response.headers.set("Cache-Control", "no-store, must-revalidate")

    return response
  }

  if (!hasSession) {
    /**
     * API requests get a JSON 401 instead of an HTML redirect: fetch() follows
     * redirects transparently, so a redirect here would hand the caller the
     * /login page's HTML where JSON was expected (res.json() would throw).
     */
    const response = request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json(
          { success: false, message: "Unauthenticated" },
          { status: 401 }
        )
      : NextResponse.redirect(new URL("/login", request.url))

    clearSessionCookies(response)
    response.headers.set("Cache-Control", "no-store, must-revalidate")

    return response
  }

  const rawUser = request.cookies.get(AUTH_USER_COOKIE_NAME)?.value

  const user = (() => {
    try {
      return rawUser ? JSON.parse(rawUser) : null
    } catch {
      return null
    }
  })()

  if (user?.role === "USER") {
    if (
      RESTRICTED_FOR_USER_ROLE.some((path) =>
        request.nextUrl.pathname.startsWith(path)
      )
    ) {
      return NextResponse.redirect(new URL("/members", request.url))
    }

    // A member's financial breakdown is admin-only too, even though the member
    // page itself is not: block the view, the offerings behind it, and the
    // code check that gates them.
    const isFinanceApi =
      request.nextUrl.pathname.startsWith("/api/members/finance-access") ||
      (request.nextUrl.pathname.startsWith("/api/members/") &&
        request.nextUrl.pathname.endsWith("/offerings"))

    if (isFinanceApi) {
      return NextResponse.json(
        { success: false, message: "Not allowed" },
        { status: 403 }
      )
    }

    if (
      request.nextUrl.pathname.startsWith("/members") &&
      request.nextUrl.searchParams.get("view") === "finance"
    ) {
      const url = request.nextUrl.clone()
      url.searchParams.delete("view")

      return NextResponse.redirect(url)
    }
  }

  if (
    MUTATING_METHODS.has(request.method) &&
    request.nextUrl.pathname.startsWith("/api/") &&
    !CSRF_EXEMPT_PATHS.has(request.nextUrl.pathname)
  ) {
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
    const headerToken = request.headers.get(CSRF_HEADER_NAME)

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing CSRF token" },
        { status: 403 }
      )
    }
  }

  /**
   * Sliding expiry: any authenticated activity resets the 24h inactivity window,
   * while loginAt (and therefore the 7-day absolute cap) is carried over unchanged.
   */
  const response = NextResponse.next()
  const common = { ...baseCookieOptions(), maxAge: AUTH_SESSION_MAX_AGE }

  response.cookies.set(AUTH_TOKEN_COOKIE_NAME, JSON.stringify(tokenSession), {
    ...common,
    httpOnly: true,
  })

  if (rawUser)
    response.cookies.set(AUTH_USER_COOKIE_NAME, rawUser, {
      ...common,
      httpOnly: false,
    })

  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  if (csrfToken)
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      ...common,
      httpOnly: false,
    })

  // Authenticated pages must never be served from the browser's back/forward
  // cache: without this, hitting Back after logout can flash the last-rendered
  // authenticated UI before any request re-checks the (now-cleared) session.
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, must-revalidate")
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/members/:path*",
    "/attendance/:path*",
    "/finances/:path*",
    "/soul-winning/:path*",
    "/settings/:path*",
    "/login",
    "/set-password",
    "/api/dashboard/:path*",
    "/api/members/:path*",
    "/api/finances/:path*",
    "/api/settings/:path*",
    "/api/upload/:path*",
    "/api/users/:path*",
  ],
}
