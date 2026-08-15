import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(_request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const { memberId } = await params

  try {
    const { data } = await api.get(
      API_ENDPOINTS.NEW_BELIEVERS_MEMBER_JOURNEY(memberId),
      withAuthHeader(token)
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to load member journey"

    return NextResponse.json({ success: false, message }, { status })
  }
}
