import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const from = request.nextUrl.searchParams.get("from")
  const to = request.nextUrl.searchParams.get("to")
  const page = request.nextUrl.searchParams.get("page")
  const limit = request.nextUrl.searchParams.get("limit")

  try {
    const { data } = await api.get(API_ENDPOINTS.ATTENDANCE_BY_MEMBER(params.memberId), {
      ...withAuthHeader(token),
      params: { from, to, page, limit },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to fetch member attendance"

    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function PUT(request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()

  try {
    const { data } = await api.put(
      API_ENDPOINTS.ATTENDANCE_BY_MEMBER(params.memberId),
      body,
      withAuthHeader(token)
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to update attendance"

    return NextResponse.json({ success: false, message }, { status })
  }
}
