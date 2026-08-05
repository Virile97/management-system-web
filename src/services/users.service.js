import { getCsrfHeader } from "@/lib/auth"
import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function listUsers(signal) {
  return fetchJson(APP_API_ENDPOINTS.USERS, { signal })
}

function deleteUser(id) {
  return fetchJson(APP_API_ENDPOINTS.USER_BY_ID(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
  })
}

export { listUsers, deleteUser }
