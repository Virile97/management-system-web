import { getCsrfHeader } from "@/lib/auth"
import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function listUsers(signal) {
  return fetchJson(APP_API_ENDPOINTS.USERS, { signal })
}

function createUser(payload) {
  return fetchJson(APP_API_ENDPOINTS.USERS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(payload),
  })
}

function updateUser(id, payload) {
  return fetchJson(APP_API_ENDPOINTS.USER_BY_ID(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(payload),
  })
}

function deleteUser(id) {
  return fetchJson(APP_API_ENDPOINTS.USER_BY_ID(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
  })
}

/**
 * Validates a set-password email token (App-Api-Key auth on the proxy).
 * Resolves to `{ email, name, role, expiresAt }`.
 */
function getSetPasswordInfo(token, signal) {
  const params = new URLSearchParams({ token })
  return fetchJson(`${APP_API_ENDPOINTS.AUTH_SET_PASSWORD}?${params}`, {
    signal,
  })
}

/**
 * Sets the password for an invited user. `password` must already be
 * RSA-encrypted with the auth public key (same as login).
 */
function setPassword({ token, password }) {
  return fetchJson(APP_API_ENDPOINTS.AUTH_SET_PASSWORD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  })
}

export {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getSetPasswordInfo,
  setPassword,
}
