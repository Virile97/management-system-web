import { getCsrfHeader } from "@/lib/auth"
import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getNewBelieversOverview(signal) {
  return fetchJson(APP_API_ENDPOINTS.NEW_BELIEVERS_OVERVIEW, { signal })
}

function createNbcLesson({ title, description, sortOrder }, signal) {
  return fetchJson(APP_API_ENDPOINTS.NEW_BELIEVERS_LESSONS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ title, description, sortOrder }),
    signal,
  })
}

function moveNbcEnrollment(enrollmentId, { lessonId, status, note }, signal) {
  return fetchJson(APP_API_ENDPOINTS.NEW_BELIEVERS_ENROLLMENT_MOVE(enrollmentId), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ lessonId, status, note }),
    signal,
  })
}

function createNbcEnrollment({ studentId, teacherId, lessonId, status }, signal) {
  return fetchJson(APP_API_ENDPOINTS.NEW_BELIEVERS_ENROLLMENTS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ studentId, teacherId, lessonId, status }),
    signal,
  })
}

function updateNbcEnrollment(enrollmentId, { teacherId, status }, signal) {
  return fetchJson(APP_API_ENDPOINTS.NEW_BELIEVERS_ENROLLMENT_BY_ID(enrollmentId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ teacherId, status }),
    signal,
  })
}

function searchAssignableStudents({ search = "", limit = 20 } = {}, signal) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (search) params.set("search", search)
  return fetchJson(
    `${APP_API_ENDPOINTS.NEW_BELIEVERS_ASSIGNABLE_STUDENTS}?${params}`,
    { signal }
  )
}

export {
  getNewBelieversOverview,
  createNbcLesson,
  moveNbcEnrollment,
  createNbcEnrollment,
  updateNbcEnrollment,
  searchAssignableStudents,
}
export default {
  getNewBelieversOverview,
  createNbcLesson,
  moveNbcEnrollment,
  createNbcEnrollment,
  updateNbcEnrollment,
  searchAssignableStudents,
}
