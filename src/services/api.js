import { ERROR_MESSAGES } from "@/utils/errors"

async function fetchWithMeta(url, options) {
  const res = await fetch(url, options)

  if (res.status === 204) {
    if (!res.ok) throw new Error(ERROR_MESSAGES.GENERIC)
    return { data: null, meta: undefined }
  }

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new Error(body.message || ERROR_MESSAGES.GENERIC)
  }

  return { data: body.data, meta: body.meta }
}

async function fetchJson(url, options) {
  const { data } = await fetchWithMeta(url, options)
  return data
}

export { fetchJson, fetchWithMeta }
