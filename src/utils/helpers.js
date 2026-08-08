/**
 * Computes whole-years age from a birth date, relative to `now` (defaults to
 * the current date). O(1) date arithmetic, no loops — safe to call on every
 * keystroke. Returns "" for an empty/invalid birthDate.
 */
function calculateAge(birthDate, now = new Date()) {
  if (!birthDate) return ""

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return ""

  let age = now.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())

  if (!hasHadBirthdayThisYear) age -= 1

  return age >= 0 ? age : ""
}

export { calculateAge }
