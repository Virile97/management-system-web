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

  const financeRange = request.nextUrl.searchParams.get("financeRange")
  const attendanceRange = request.nextUrl.searchParams.get("attendanceRange")
  const activityLimit = request.nextUrl.searchParams.get("activityLimit")

  try {
    const { data } = await api.get(API_ENDPOINTS.DASHBOARD, {
      ...withAuthHeader(token),
      params: {
        ...(financeRange ? { financeRange } : {}),
        ...(attendanceRange ? { attendanceRange } : {}),
        ...(activityLimit ? { activityLimit } : {}),
      },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to fetch dashboard overview"

    return NextResponse.json({ success: false, message }, { status })
  }
}
