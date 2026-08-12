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

  const page = request.nextUrl.searchParams.get("page")
  const limit = request.nextUrl.searchParams.get("limit")
  const search = request.nextUrl.searchParams.get("search")
  const status = request.nextUrl.searchParams.get("status")
  const from = request.nextUrl.searchParams.get("from")
  const to = request.nextUrl.searchParams.get("to")

  try {
    const { data } = await api.get(API_ENDPOINTS.MEMBERS, {
      ...withAuthHeader(token),
      params: { page, limit, search, status, from, to },
    })
    return NextResponse.json(data)
  } catch (err) {
    const responseStatus = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to fetch members"

    return NextResponse.json(
      { success: false, message },
      { status: responseStatus }
    )
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
      API_ENDPOINTS.MEMBERS,
      body,
      withAuthHeader(token)
    )
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to create member"

    return NextResponse.json({ success: false, message }, { status })
  }
}
