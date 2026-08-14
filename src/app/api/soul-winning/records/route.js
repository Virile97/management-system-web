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

  const params = Object.fromEntries(request.nextUrl.searchParams)

  try {
    const { data } = await api.get(API_ENDPOINTS.SOUL_WINNING_RECORDS, {
      ...withAuthHeader(token),
      params,
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to fetch soul winning records"

    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function POST(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const body = await request.json()

  try {
    const { data } = await api.post(
      API_ENDPOINTS.SOUL_WINNING_RECORDS,
      body,
      withAuthHeader(token)
    )
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to create soul winning record"

    return NextResponse.json({ success: false, message }, { status })
  }
}
