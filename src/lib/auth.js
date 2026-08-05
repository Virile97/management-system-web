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

export { encryptWithPublicKey, getCsrfHeader }
