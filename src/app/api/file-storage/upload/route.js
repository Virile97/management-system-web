import { NextResponse } from "next/server"

import { getSessionToken } from "@/lib/session"
import { API_ENDPOINTS } from "@/utils/constants"

/**
 * Multipart upload — the one BFF route that can't go through the shared
 * axios instance (src/lib/axios.js forces Content-Type: application/json).
 * Native fetch + FormData set the multipart boundary correctly on their
 * own; setting Content-Type manually here would break it.
 */
export async function POST(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  try {
    const incoming = await request.formData()
    const file = incoming.get("file")
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      )
    }

    const forward = new FormData()
    forward.append("file", file, file.name)
    const folderId = incoming.get("folderId")
    if (folderId) forward.append("folderId", String(folderId))
    const tags = incoming.get("tags")
    if (tags) forward.append("tags", String(tags))

    const res = await fetch(
      `${process.env.BACKEND_URL}${API_ENDPOINTS.FILE_STORAGE_UPLOAD}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "App-Api-Key": process.env.APP_API_KEY,
        },
        body: forward,
      }
    )

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Unable to upload file" },
      { status: 500 }
    )
  }
}
