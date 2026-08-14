import { NextResponse } from "next/server"
import { headers } from "next/headers"

import { api, withAuthHeader } from "@/lib/axios"
import {
  clearSessionCookies,
  forwardBackendSetCookie,
  getSessionToken,
} from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function POST() {
  const token = getSessionToken()
  const cookieHeader = headers().get("cookie") ?? ""

  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
    data: { loggedOut: true },
  })

  if (token) {
    try {
      const backendRes = await api.post(
        API_ENDPOINTS.AUTH_LOGOUT,
        {},
        {
          headers: {
            ...withAuthHeader(token).headers,
            Cookie: cookieHeader,
          },
        }
      )
      // Rewrite Path so the browser clears our Path=/api/auth refresh cookie.
      forwardBackendSetCookie(res, backendRes)
    } catch {
      // Best-effort: access JWT may already be expired.
    }
  }

  clearSessionCookies(res)
  return res
}
