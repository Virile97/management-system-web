import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const date = request.nextUrl.searchParams.get("date")
  const level = request.nextUrl.searchParams.get("level")
  const search = request.nextUrl.searchParams.get("search")
  const page = request.nextUrl.searchParams.get("page")
  const limit = request.nextUrl.searchParams.get("limit")

  try {
    const { data } = await api.get(API_ENDPOINTS.ATTENDANCE, {
      ...withAuthHeader(token),
      params: { date, level, search, page, limit },
    })
    return NextResponse.json(data)
  } catch (err) {
    const responseStatus = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to fetch attendance"

    return NextResponse.json({ success: false, message }, { status: responseStatus })
  }
}
