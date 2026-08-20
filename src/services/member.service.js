import { getCsrfHeader } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getMemberFormConfig(signal) {
  return fetchJson(APP_API_ENDPOINTS.MEMBERS_CONFIG, { signal })
}

function getMemberById(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.MEMBER_BY_ID(id), { signal })
}

async function getMemberDetail(id, { page = 1, limit = 20 } = {}, signal) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(Math.min(100, Math.max(1, limit))),
  })

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.MEMBER_BY_ID(id)}?${params}`,
    { signal }
  )

  return {
    data,
    meta: meta || {
      page,
      limit,
      total: data?.attendances?.length ?? 0,
      totalPages: 1,
    },
  }
}

function formatMemberName(member) {
  return (
    [member.firstName, member.middleName, member.lastName]
      .filter(Boolean)
      .join(" ") || "—"
  )
}

function normalizeMember(member) {
  return {
    ...member,
    name: formatMemberName(member),
    phone: member.contact,
    group: member.groups?.length
      ? member.groups.map((group) => group.role).join(", ")
      : "—",
    baptized: member.baptizedAt
      ? new Date(member.baptizedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    status: member.status?.name ?? "—",
    statusId: member.statusId || member.status?.id || "",
    level: member.level?.name ?? "—",
    levelId: member.levelId || member.level?.id || "",
    needsUpdate: Boolean(member.needsUpdate),
  }
}

async function listMembers(
  {
    page = 1,
    limit = 20,
    search = "",
    status = "",
    levelId = "",
    from = "",
    to = "",
    excludeDeceased = false,
  } = {},
  signal
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  if (search) params.set("search", search)
  if (status) params.set("status", status)
  if (levelId) params.set("levelId", levelId)
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  if (excludeDeceased) params.set("excludeDeceased", "true")

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.MEMBERS}?${params}`,
    { signal }
  )

  return { data: data.map(normalizeMember), meta }
}

function getMemberBreakdown(
  { search = "", status = "", from = "", to = "" } = {},
  signal
) {
  const params = new URLSearchParams()

  if (search) params.set("search", search)

  if (status) params.set("status", status)

  if (from) params.set("from", from)

  if (to) params.set("to", to)

  const query = params.toString()
  return fetchJson(
    `${APP_API_ENDPOINTS.MEMBERS_BREAKDOWN}${query ? `?${query}` : ""}`,
    { signal }
  )
}

function toCreateMemberPayload(form) {
  const payload = {
    firstName: form.firstName,
    lastName: form.lastName,
  }

  const fields = {
    middleName: form.middleName,
    email: form.email,
    contact: form.contact,
    address: form.address,
    gender: form.gender,
    birthDate: form.birthDate,
    baptizedAt: form.baptizedAt,
  }

  Object.entries(fields).forEach(([key, value]) => {
    if (value) payload[key] = value
  })

  if (form.age) payload.age = Number(form.age)
  if (form.status) payload.statusId = form.status
  if (form.level) payload.levelId = form.level
  if (form.lighthouseGroup) payload.lighthouseGroupId = form.lighthouseGroup
  if (form.groupIds.length) payload.groupIds = form.groupIds
  payload.isNewBeliever = Boolean(form.isNewBeliever)
  payload.needsUpdate = Boolean(form.needsUpdate)

  return payload
}

function toUpdateMemberPayload(form) {
  const payload = {}
  const fields = {
    firstName: form.firstName,
    lastName: form.lastName,
    middleName: form.middleName,
    email: form.email,
    contact: form.contact,
    address: form.address,
    gender: form.gender,
    birthDate: form.birthDate,
    baptizedAt: form.baptizedAt,
  }

  Object.entries(fields).forEach(([key, value]) => {
    if (value) payload[key] = value
  })

  if (form.age) payload.age = Number(form.age)
  if (form.status) payload.statusId = form.status
  if (form.level) payload.levelId = form.level
  if (form.lighthouseGroup) payload.lighthouseGroupId = form.lighthouseGroup

  payload.groupIds = form.groupIds
  payload.isNewBeliever = Boolean(form.isNewBeliever)
  payload.needsUpdate = Boolean(form.needsUpdate)

  return payload
}

const mutationOptions = (method, payload) => ({
  method,
  headers: { "Content-Type": "application/json", ...getCsrfHeader() },
  body: JSON.stringify(payload),
})

function createMember(form) {
  return fetchJson(
    APP_API_ENDPOINTS.MEMBERS,
    mutationOptions("POST", toCreateMemberPayload(form))
  )
}

async function updateMember(id, form) {
  const updated = await fetchJson(
    APP_API_ENDPOINTS.MEMBER_BY_ID(id),
    mutationOptions("PATCH", toUpdateMemberPayload(form))
  )
  return normalizeMember(updated)
}

function deleteMember(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.MEMBER_BY_ID(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

function bulkDeleteMembers(ids) {
  return fetchJson(
    APP_API_ENDPOINTS.MEMBERS_BULK_DELETE,
    mutationOptions("POST", { ids })
  )
}

/** For member pickers where a deceased member must never be selectable
 * (e.g. soul winner search) — matches MemberSearchModal's `searchFn`
 * contract (query, signal) => member[]. */
async function searchActiveMembers(search, signal) {
  const { data } = await listMembers(
    { page: 1, limit: 20, search, excludeDeceased: true },
    signal
  )
  return data
}

export {
  normalizeMember,
  listMembers,
  searchActiveMembers,
  getMemberBreakdown,
  createMember,
  updateMember,
  deleteMember,
  bulkDeleteMembers,
  getMemberFormConfig,
  getMemberById,
  getMemberDetail,
}
