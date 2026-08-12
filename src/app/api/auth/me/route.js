import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { readValidTokenCookie } from "@/lib/session"
import {
  AUTH_TOKEN_COOKIE_NAME,
  AUTH_USER_COOKIE_NAME,
} from "@/utils/constants"

export async function GET() {
  const cookieStore = cookies()
  const tokenSession = readValidTokenCookie(
    cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value
  )
  const rawUser = cookieStore.get(AUTH_USER_COOKIE_NAME)?.value

  if (!tokenSession || !rawUser) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  try {
    const user = JSON.parse(rawUser)
    return NextResponse.json({ success: true, data: { user } })
  } catch {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    )
  }
}
