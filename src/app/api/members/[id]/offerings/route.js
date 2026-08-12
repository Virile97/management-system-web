import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET(request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get("period")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const page = searchParams.get("page")
  const limit = searchParams.get("limit")
  // Repeated ?offeringTypeId=a&offeringTypeId=b — getAll keeps every value;
  // Object.fromEntries would collapse them to the last one.
  const offeringTypeId = searchParams.getAll("offeringTypeId")

  try {
    const { data } = await api.get(API_ENDPOINTS.MEMBER_OFFERINGS(params.id), {
      ...withAuthHeader(token),
      params: {
        period,
        from,
        to,
        page,
        limit,
        ...(offeringTypeId.length ? { offeringTypeId } : {}),
      },
      paramsSerializer: {
        // Keep repeated keys as offeringTypeId=a&offeringTypeId=b (no [] suffix).
        indexes: null,
      },
    })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message =
      err?.response?.data?.message || "Unable to fetch member offerings"

    return NextResponse.json({ success: false, message }, { status })
  }
}
