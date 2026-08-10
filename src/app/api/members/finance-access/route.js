import { NextResponse } from "next/server"
import { createHash, randomBytes, timingSafeEqual } from "crypto"

import { getSessionToken } from "@/lib/session"

/**
 * Unlike the other /api/members routes this one is not a backend proxy: the
 * finance access code lives only in this app's environment (FINANCE_ACCESS_CODE),
 * so the comparison happens here.
 *
 * The code is never put on the wire. GET issues a single-use nonce, the client
 * posts back SHA-256("<nonce>:<code>"), and this route recomputes the same
 * digest from the environment's code. A network capture (or the browser's own
 * devtools) therefore only ever shows an opaque digest that can't be replayed
 * once its nonce is spent.
 *
 * Nonces live in this process's memory, which is fine for a single instance —
 * a multi-instance deployment would need a shared store (or signed, stateless
 * nonces) instead.
 */
const NONCE_TTL_MS = 2 * 60 * 1000

const issuedNonces = new Map()

function pruneExpiredNonces(now) {
  for (const [nonce, expiresAt] of issuedNonces) {
    if (expiresAt <= now) issuedNonces.delete(nonce)
  }
}

function digestFor(nonce, code) {
  return createHash("sha256").update(`${nonce}:${code}`).digest("hex")
}

function digestsMatch(given, expected) {
  const givenBuffer = Buffer.from(String(given))
  const expectedBuffer = Buffer.from(expected)

  // timingSafeEqual throws on a length mismatch, and a wrong-length digest is
  // already known-bad without needing a constant-time comparison.
  if (givenBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(givenBuffer, expectedBuffer)
}

export async function GET() {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const now = Date.now()
  pruneExpiredNonces(now)

  const nonce = randomBytes(32).toString("hex")
  issuedNonces.set(nonce, now + NONCE_TTL_MS)

  return NextResponse.json({ success: true, data: { nonce } })
}

export async function POST(request) {
  const token = getSessionToken()
  if (!token) {
    return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
  }

  const expectedCode = process.env.FINANCE_ACCESS_CODE
  if (!expectedCode) {
    return NextResponse.json(
      { success: false, message: "Finance access is not configured. Contact your administrator." },
      { status: 503 }
    )
  }

  const body = await request.json().catch(() => null)
  const { nonce, digest } = body ?? {}

  // Spent on sight, pass or fail, so a captured digest is never usable twice.
  const expiresAt = nonce ? issuedNonces.get(nonce) : undefined
  if (nonce) issuedNonces.delete(nonce)

  if (!expiresAt || expiresAt <= Date.now()) {
    return NextResponse.json(
      { success: false, message: "This request expired. Please try again." },
      { status: 403 }
    )
  }

  if (!digest || !digestsMatch(digest, digestFor(nonce, expectedCode))) {
    // 403 rather than 401: the session is valid, only the extra code is wrong,
    // and a 401 would put the client's fetch layer into its refresh/logout path.
    return NextResponse.json({ success: false, message: "Incorrect access code" }, { status: 403 })
  }

  return NextResponse.json({ success: true, data: { unlocked: true } })
}
