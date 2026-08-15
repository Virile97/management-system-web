export const NBC_ENROLLMENT_STATUS = Object.freeze({
  ON_TRACK: "ON_TRACK",
  BEHIND: "BEHIND",
  ADVANCED: "ADVANCED",
})

export const NBC_STATUS_LABELS = Object.freeze({
  ON_TRACK: "On Track",
  BEHIND: "Behind",
  ADVANCED: "Advanced",
})

export const NBC_STATUS_FILTERS = Object.freeze([
  { key: "all", label: "All" },
  { key: NBC_ENROLLMENT_STATUS.BEHIND, label: NBC_STATUS_LABELS.BEHIND },
  { key: NBC_ENROLLMENT_STATUS.ON_TRACK, label: NBC_STATUS_LABELS.ON_TRACK },
  { key: NBC_ENROLLMENT_STATUS.ADVANCED, label: NBC_STATUS_LABELS.ADVANCED },
])

export const NBC_STATUS_RANK = Object.freeze({
  [NBC_ENROLLMENT_STATUS.BEHIND]: 0,
  [NBC_ENROLLMENT_STATUS.ON_TRACK]: 1,
  [NBC_ENROLLMENT_STATUS.ADVANCED]: 2,
})
