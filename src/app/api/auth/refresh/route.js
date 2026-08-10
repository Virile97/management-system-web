import { NextResponse } from "next/server"

import { api } from "@/lib/axios"
import { setAccessTokenCookie, forwardBackendSetCookie, getSessionLoginAt } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

/**
 * Exchanges the backend's httpOnly refresh-token cookie (set on this app's
 * own domain by /auth/login, opaque to us) for a new access token. The
 * refresh cookie isn't something we read or name — we just forward whatever
 * cookies the browser sent us straight through to the backend, since that's
 * where the refresh cookie actually lives and is validated.
 */
export async function POST(request) {
  try {
    const backendRes = await api.post(
      API_ENDPOINTS.AUTH_REFRESH,
      {},
      { headers: { Cookie: request.headers.get("cookie") ?? "" } }
    )

    const token = backendRes.data?.data?.token
    if (!token) {
      return NextResponse.json({ success: false, message: "Refresh failed" }, { status: 401 })
    }

    const res = NextResponse.json({ success: true, data: { refreshed: true } })

    // Preserve the original loginAt so the absolute session cap keeps
    // counting from first login rather than resetting on every refresh.
    setAccessTokenCookie(res, { token, loginAt: getSessionLoginAt() ?? Date.now() })

    // The backend may rotate the refresh token itself — relay whatever it sets.
    forwardBackendSetCookie(res, backendRes)

    return res
  } catch (err) {
    const status = err?.response?.status || 401
    const message = err?.response?.data?.message || "Refresh failed"

    return NextResponse.json({ success: false, message }, { status })
  }
}
