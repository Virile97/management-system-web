import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { clearSessionCookies, getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function POST() {
  const token = getSessionToken()

  if (token) {
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT, {}, withAuthHeader(token))
    } catch {
      // Best-effort: even if the backend call fails (e.g. token already expired),
      // still clear our own cookies below so the user is logged out locally.
    }
  }

  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
    data: { loggedOut: true },
  })

  clearSessionCookies(res)

  return res
}
