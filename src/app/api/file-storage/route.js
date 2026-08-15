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

  try {
    const search = request.nextUrl.searchParams.toString()
    const url = search
      ? `${API_ENDPOINTS.FILE_STORAGE_LIST}?${search}`
      : API_ENDPOINTS.FILE_STORAGE_LIST
    const { data } = await api.get(url, { ...withAuthHeader(token) })
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to fetch files"

    return NextResponse.json({ success: false, message }, { status })
  }
}
