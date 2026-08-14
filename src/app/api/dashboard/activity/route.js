import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const search = request.nextUrl.searchParams.get("search")
  const limit = request.nextUrl.searchParams.get("limit")

  try {
    const { data } = await api.get(API_ENDPOINTS.DASHBOARD_ACTIVITY, {
      ...withAuthHeader(token),
      params: {
        ...(search ? { search } : {}),
        ...(limit ? { limit } : {}),
      },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to search activity"

    return NextResponse.json({ success: false, message }, { status })
  }
}
