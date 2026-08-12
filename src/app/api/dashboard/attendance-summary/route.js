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

  const range = request.nextUrl.searchParams.get("range") || "8w"

  try {
    const { data } = await api.get(API_ENDPOINTS.DASHBOARD_ATTENDANCE_SUMMARY, {
      ...withAuthHeader(token),
      params: { range },
    })

    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to fetch attendance summary"

    return NextResponse.json({ success: false, message }, { status })
  }
}
