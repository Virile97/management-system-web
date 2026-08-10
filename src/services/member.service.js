import { getCsrfHeader } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getMemberFormConfig(signal) {
  return fetchJson(APP_API_ENDPOINTS.MEMBERS_CONFIG, { signal })
}

function getMemberById(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.MEMBER_BY_ID(id), { signal })
}

function formatMemberName(member) {
  return [member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ") || "—"
}

function normalizeMember(member) {
  return {
    ...member,
    name: formatMemberName(member),
    phone: member.contact,
    group: member.groups?.length > 0 ? member.groups.map((g) => g.role).join(", ") : "—",
    baptized: member.baptizedAt
      ? new Date(member.baptizedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    status: member.status?.name ?? "—",
  }
}

async function listMembers({ page = 1, limit = 20, search = "", status = "", from = "", to = "" } = {}, signal) {
  const params = new URLSearchParams()

  params.set("page", String(page))
  params.set("limit", String(limit))

  if (search) params.set("search", search)
  if (status) params.set("status", status)
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  const { data, meta } = await fetchWithMeta(`${APP_API_ENDPOINTS.MEMBERS}?${params.toString()}`, { signal })

  return { data: data.map(normalizeMember), meta }
}

/**
 * Member status breakdown (donut chart) — pass the same search/status/from/to
 * as listMembers so the breakdown matches whatever's in the table.
 */
function getMemberBreakdown({ search = "", status = "", from = "", to = "" } = {}, signal) {
  const params = new URLSearchParams()

  if (search) params.set("search", search)
  if (status) params.set("status", status)
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  const query = params.toString()
  return fetchJson(`${APP_API_ENDPOINTS.MEMBERS_BREAKDOWN}${query ? `?${query}` : ""}`, { signal })
}

/**
 * Maps Add Member form state into the backend's createMemberSchema shape.
 * The form already stores config option ids (statusId/levelId/lighthouseGroupId/
 * groupIds) since <Select>/checkbox values are the config item ids directly —
 * no lookup needed, just forward them under the field names the API expects.
 */
function toCreateMemberPayload(form) {
  const payload = {
    firstName: form.firstName,
    lastName: form.lastName,
  }

  if (form.middleName) payload.middleName = form.middleName
  if (form.email) payload.email = form.email
  if (form.contact) payload.contact = form.contact
  if (form.address) payload.address = form.address
  if (form.age) payload.age = Number(form.age)
  if (form.gender) payload.gender = form.gender
  if (form.birthDate) payload.birthDate = form.birthDate
  if (form.baptizedAt) payload.baptizedAt = form.baptizedAt
  if (form.status) payload.statusId = form.status
  if (form.level) payload.levelId = form.level
  if (form.lighthouseGroup) payload.lighthouseGroupId = form.lighthouseGroup
  if (form.groupIds.length > 0) payload.groupIds = form.groupIds

  return payload
}

function createMember(form) {
  return fetchJson(APP_API_ENDPOINTS.MEMBERS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(toCreateMemberPayload(form)),
  })
}

/**
 * Maps Edit Member form state into the backend's updateMemberSchema shape.
 * Every field is optional on this endpoint, but groupIds always replaces the
 * full group selection (not an append) — including it as [] intentionally
 * clears all groups rather than leaving them untouched, so it's always sent.
 */
function toUpdateMemberPayload(form) {
  const payload = {}

  if (form.firstName) payload.firstName = form.firstName
  if (form.lastName) payload.lastName = form.lastName
  if (form.middleName) payload.middleName = form.middleName
  if (form.email) payload.email = form.email
  if (form.contact) payload.contact = form.contact
  if (form.address) payload.address = form.address
  if (form.age) payload.age = Number(form.age)
  if (form.gender) payload.gender = form.gender
  if (form.birthDate) payload.birthDate = form.birthDate
  if (form.baptizedAt) payload.baptizedAt = form.baptizedAt
  if (form.status) payload.statusId = form.status
  if (form.level) payload.levelId = form.level
  if (form.lighthouseGroup) payload.lighthouseGroupId = form.lighthouseGroup
  payload.groupIds = form.groupIds

  return payload
}

function updateMember(id, form) {
  return fetchJson(APP_API_ENDPOINTS.MEMBER_BY_ID(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(toUpdateMemberPayload(form)),
  })
}

function bulkDeleteMembers(ids) {
  return fetchJson(APP_API_ENDPOINTS.MEMBERS_BULK_DELETE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ ids }),
  })
}

export {
  normalizeMember,
  listMembers,
  getMemberBreakdown,
  createMember,
  updateMember,
  bulkDeleteMembers,
  getMemberFormConfig,
  getMemberById,
}
