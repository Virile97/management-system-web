import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function PATCH(request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { data } = await api.patch(
      API_ENDPOINTS.FILE_STORAGE_MOVE(id),
      body,
      withAuthHeader(token)
    )
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to move file"

    return NextResponse.json({ success: false, message }, { status })
  }
}
