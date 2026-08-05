import { fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function formatMemberName(member) {
  return [member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ") || "—"
}

function normalizeMember(member) {
  return {
    ...member,
    name: formatMemberName(member),
    phone: member.contact,
    group: member.group?.name ?? "—",
    joined: member.joinedAt
      ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    status: member.status?.name ?? "—",
  }
}

async function listMembers({ page = 1, limit = 20, search = "", status = "" } = {}, signal) {
  const params = new URLSearchParams()

  params.set("page", String(page))
  params.set("limit", String(limit))

  if (search) params.set("search", search)

  if (status) params.set("status", status)

  const { data, meta } = await fetchWithMeta(`${APP_API_ENDPOINTS.MEMBERS}?${params.toString()}`, { signal })

  return { data: data.map(normalizeMember), meta }
}

export { listMembers }
