import { NextResponse } from "next/server"

import { api } from "@/lib/axios"
import { setSessionCookies, forwardBackendSetCookie } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Set-password token is required" },
      { status: 400 }
    )
  }

  try {
    const { data } = await api.get(API_ENDPOINTS.AUTH_SET_PASSWORD, {
      params: { token },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to validate set-password link"

    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function POST(request) {
  const body = await request.json()

  try {
    const backendRes = await api.post(API_ENDPOINTS.AUTH_SET_PASSWORD, body)
    const { data } = backendRes

    const res = NextResponse.json({
      success: true,
      message: data.message,
      data: { user: data.data.user },
    })

    setSessionCookies(res, {
      token: data.data.token,
      user: data.data.user,
    })

    // Same as login: relay the backend refresh-token Set-Cookie.
    forwardBackendSetCookie(res, backendRes)

    return res
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message ||
      "Unable to set password. Please try again."

    return NextResponse.json({ success: false, message }, { status })
  }
}
