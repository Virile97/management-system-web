const PEM_HEADER = "-----BEGIN PUBLIC KEY-----"
const PEM_FOOTER = "-----END PUBLIC KEY-----"

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(PEM_HEADER, "")
    .replace(PEM_FOOTER, "")
    .replace(/\s/g, "")

  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return window.btoa(binary)
}

async function importRsaPublicKey(pem) {
  const keyData = pemToArrayBuffer(pem)

  return window.crypto.subtle.importKey(
    "spki",
    keyData,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )
}

async function encryptWithPublicKey(publicKeyPem, plainText) {
  const key = await importRsaPublicKey(publicKeyPem)
  const encoded = new TextEncoder().encode(plainText)
  const ciphertext = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, encoded)

  return arrayBufferToBase64(ciphertext)
}

/**
 * SHA-256 of "<nonce>:<value>" as a hex string, for proving knowledge of a
 * secret (the finance access code) without ever sending it. The server issues
 * the nonce and recomputes the same digest from its own copy of the secret.
 */
async function hashWithNonce(nonce, value) {
  const encoded = new TextEncoder().encode(`${nonce}:${value}`)
  const digest = await window.crypto.subtle.digest("SHA-256", encoded)

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))

  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Header to attach to mutating (POST/PUT/PATCH/DELETE) fetches to our own
 * /api/* routes, double-submitted against the csrf_token cookie set at login.
 */
function getCsrfHeader() {
  const token = readCookie("csrf_token")

  return token ? { "x-csrf-token": token } : {}
}

/**
 * Reads the signed-in user ({ id, email, name, role }) from the non-httpOnly
 * auth_user cookie. Returns null if absent/unparseable (e.g. logged out).
 */
function getCurrentUser() {
  const raw = readCookie("auth_user")

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export { encryptWithPublicKey, hashWithNonce, getCsrfHeader, getCurrentUser }
