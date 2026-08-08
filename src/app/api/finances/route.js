import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const params = Object.fromEntries(request.nextUrl.searchParams)
  const { page, limit, type, category, search, from, to } = params

  try {
    const { data } = await api.get(API_ENDPOINTS.TRANSACTIONS, {
      ...withAuthHeader(token),
      params: { page, limit, type, category, search, from, to },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to fetch transactions"

    return NextResponse.json({ success: false, message }, { status })
  }
}

export async function POST(request) {
  return NextResponse.json({ message: "Not implemented" }, { status: 501 })
}
