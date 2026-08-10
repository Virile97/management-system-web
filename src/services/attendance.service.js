/**
 * No /attendance backend route exists yet, so these resolve from mock data
 * instead of calling fetchJson. Signatures match the dashboard/finance
 * services (date-scoped, group-scoped, AbortSignal-aware) so swapping in
 * real endpoints later is a one-line change per function, not a page rewrite.
 */

const MOCK_MEMBERS = [
  { id: 1, name: "Pastor Admin", level: "Men", morningIn: "08:02 AM", morningOut: "12:15 PM", afternoonIn: "01:30 PM", afternoonOut: "05:00 PM", status: "Full day" },
  { id: 2, name: "Emmanuel Boateng", level: "Men", morningIn: "08:20 AM", morningOut: "12:10 PM", afternoonIn: null, afternoonOut: null, status: "Morning only" },
  { id: 3, name: "Grace Mensah", level: "Ladies", morningIn: "07:55 AM", morningOut: "12:00 PM", afternoonIn: "01:15 PM", afternoonOut: "05:05 PM", status: "Full day" },
  { id: 4, name: "Samuel Tetteh", level: "Young People", morningIn: "08:45 AM", morningOut: null, afternoonIn: null, afternoonOut: null, status: "Morning only" },
  { id: 5, name: "Abena Osei", level: "Ladies", morningIn: "08:00 AM", morningOut: "12:05 PM", afternoonIn: "01:20 PM", afternoonOut: "04:55 PM", status: "Full day" },
  { id: 6, name: "Kwame Asante", level: "Career", morningIn: "09:10 AM", morningOut: "12:30 PM", afternoonIn: "01:45 PM", afternoonOut: null, status: "Full day" },
  { id: 7, name: "Esi Forson", level: "Young People", morningIn: null, morningOut: null, afternoonIn: "01:00 PM", afternoonOut: "05:10 PM", status: "Afternoon only" },
  { id: 8, name: "Bright Boadu", level: "Career", morningIn: "08:05 AM", morningOut: "12:20 PM", afternoonIn: "01:10 PM", afternoonOut: "05:00 PM", status: "Full day" },
  { id: 9, name: "Maame Agyei", level: "Ladies", morningIn: "07:50 AM", morningOut: "11:55 AM", afternoonIn: "01:00 PM", afternoonOut: "04:45 PM", status: "Full day" },
  { id: 10, name: "Joseph Owusu", level: "Men", morningIn: null, morningOut: null, afternoonIn: null, afternoonOut: null, status: "Absent" },
]

const MOCK_MEMBER_ATTENDANCE = [
  { id: 1, event: "Sunday Worship", daysAgo: 6, status: "Present" },
  { id: 2, event: "Sunday Worship", daysAgo: 13, status: "Present" },
  { id: 3, event: "Sunday Worship", daysAgo: 20, status: "Absent" },
  { id: 4, event: "Prayer Night", daysAgo: 27, status: "Present" },
  { id: 5, event: "Sunday Worship", daysAgo: 34, status: "Absent" },
]

const MOCK_STATS = {
  total: 12,
  present: 11,
  attendanceRate: 92,
  fullDay: 8,
  partial: 3,
  partialMorning: 2,
  partialAfternoon: 1,
  absent: 1,
}

function mockResolve(value, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"))
    resolve(value)
  })
}

function getAttendanceStats(dateRange, signal) {
  return mockResolve(MOCK_STATS, signal)
}

function getAttendanceMembers(dateRange, signal) {
  return mockResolve(MOCK_MEMBERS, signal)
}

/**
 * The last few services a single member was checked in/out for, newest first.
 * Dates are derived from today so the mock stays plausible over time.
 */
function getMemberRecentAttendance(memberId, signal) {
  const now = Date.now()
  const records = MOCK_MEMBER_ATTENDANCE.map((record) => ({
    id: record.id,
    event: record.event,
    status: record.status,
    date: new Date(now - record.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  }))

  return mockResolve(records, signal)
}

export { getAttendanceStats, getAttendanceMembers, getMemberRecentAttendance }
