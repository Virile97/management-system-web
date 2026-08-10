import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"

import { getSessionToken } from "@/lib/session"

/**
 * Unlike the other /api/members routes this one is not a backend proxy: the
 * finance access code lives only in this app's environment (FINANCE_ACCESS_CODE),
 * so the comparison happens here. Keeping it server-side means the code is never
 * shipped to the browser; the client only ever learns pass/fail.
 */
function codesMatch(input, expected) {
  const given = Buffer.from(String(input))
  const actual = Buffer.from(expected)

  // timingSafeEqual throws on length mismatch, and the length itself is not a
  // secret worth protecting here.
  if (given.length !== actual.length) return false

  return timingSafeEqual(given, actual)
}

export async function POST(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const expected = process.env.FINANCE_ACCESS_CODE
  if (!expected) {
    return NextResponse.json(
      { success: false, message: "Finance access is not configured. Contact your administrator." },
      { status: 503 }
    )
  }

  const body = await request.json().catch(() => null)
  const code = body?.code

  if (!code || !codesMatch(code, expected)) {
    // 403 rather than 401: the session is valid, only the extra code is wrong,
    // and a 401 would put the client's fetch layer into its refresh/logout path.
    return NextResponse.json({ success: false, message: "Incorrect access code" }, { status: 403 })
  }

  return NextResponse.json({ success: true, data: { unlocked: true } })
}
