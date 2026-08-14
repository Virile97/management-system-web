import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function POST(request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  try {
    const { data } = await api.post(
      API_ENDPOINTS.SOUL_WINNING_BAPTIZE(id),
      body,
      withAuthHeader(token)
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to baptize convert"

    return NextResponse.json({ success: false, message }, { status })
  }
}
