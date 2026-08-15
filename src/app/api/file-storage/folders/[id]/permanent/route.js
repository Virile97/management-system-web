import { NextResponse } from "next/server"

import { api, withAuthHeader } from "@/lib/axios"
import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

export async function DELETE(request, { params }) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    await api.delete(
      API_ENDPOINTS.FILE_STORAGE_FOLDER_PERMANENT_DELETE(id),
      withAuthHeader(token)
    )
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    const status = err?.response?.status || 500
    const message = err?.response?.data?.message || "Unable to permanently delete folder"

    return NextResponse.json({ success: false, message }, { status })
  }
}
