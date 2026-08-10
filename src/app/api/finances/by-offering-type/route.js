import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const { period, from, to, offeringTypeId } = Object.fromEntries(request.nextUrl.searchParams)

  try {
    const { data } = await api.get(API_ENDPOINTS.TRANSACTIONS_BY_OFFERING_TYPE, {
      ...withAuthHeader(token),
      params: { period, from, to, offeringTypeId },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to fetch offering type breakdown"

    return NextResponse.json({ success: false, message }, { status })
  }
}
