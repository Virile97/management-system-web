import { NextResponse } from "next/server"

import { api } from "@/lib/axios"
import { API_ENDPOINTS } from "@/utils/constants"

export async function GET() {
  try {
    const { data } = await api.get(API_ENDPOINTS.AUTH_PUBLIC_KEY)
    return NextResponse.json(data)
  } catch (err) {
    const status = err?.response?.status || 500

    const message = err?.response?.data?.message || "Unable to fetch public key"
    return NextResponse.json({ success: false, message }, { status })
  }
}
