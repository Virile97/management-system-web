import { useEffect, useRef, useState } from "react"

/**
 * Trailing throttle: emits at most once per `interval`, always ending on the latest value.
 */
function useThrottle(value, interval = 500) {
  const [throttled, setThrottled] = useState(value)
  const lastEmittedAt = useRef(0)
  const pending = useRef(null)

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastEmittedAt.current
    const remaining = interval - elapsed

    if (remaining <= 0) {
      lastEmittedAt.current = now
      setThrottled(value)
      return
    }

    clearTimeout(pending.current)
    pending.current = setTimeout(() => {
      lastEmittedAt.current = Date.now()
      setThrottled(value)
      pending.current = null
    }, remaining)

    return () => {
      clearTimeout(pending.current)
    }
  }, [value, interval])

  return throttled
}

export { useThrottle }
export default useThrottle
