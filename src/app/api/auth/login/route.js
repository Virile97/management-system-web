import { NextResponse } from "next/server"

import { api } from "@/lib/axios"
import { setSessionCookies } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function POST(request) {
  const { email, password } = await request.json()

  try {
    const { data } = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password })

    const res = NextResponse.json({ success: true, message: data.message, data: { user: data.data.user } })
    setSessionCookies(res, { token: data.data.token, user: data.data.user })
    return res
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to sign in. Please check your credentials and try again."

    return NextResponse.json({ success: false, message }, { status })
  }
}
