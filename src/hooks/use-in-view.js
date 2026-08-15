import { useEffect, useRef, useState } from "react"

/**
 * Reports whether the observed element has ever intersected the viewport.
 * Once true, stays true (the observer disconnects) — used to lazy-trigger a
 * one-time fetch (e.g. a signed URL) rather than track ongoing visibility.
 */
function useInView({ rootMargin = "200px" } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || inView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return [ref, inView]
}

export { useInView }
export default useInView
