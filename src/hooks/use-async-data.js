import { useCallback, useEffect, useRef, useState } from "react"

import { withRetry } from "@/services/api"

function useAsyncData(buildTasks, { maxAttempts, deps = [] } = {}) {
  const [error, setError] = useState("")
  const [retryToken, setRetryToken] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const retry = useCallback(() => setRetryToken((token) => token + 1), [])
  const errorRef = useRef(error)
  errorRef.current = error

  useEffect(() => {
    const controller = new AbortController()
    const tasks = buildTasks()

    async function load() {
      setIsLoading(true)
      setError("")

      const results = await Promise.allSettled(
        tasks.map(([fetcher]) => withRetry((attempt) => fetcher(controller.signal, attempt), {
          maxAttempts,
          signal: controller.signal,
        }))
      )

      if (controller.signal.aborted) return

      results.forEach((result, index) => {
        if (result.status === "fulfilled") tasks[index][1](result.value)
      })

      const failed = results.find((result) => result.status === "rejected")
      if (failed) setError(failed.reason.message)

      setIsLoading(false)
    }

    load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryToken, ...deps])

  useEffect(() => {
    function handleOnline() {
      if (errorRef.current) retry()
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [retry])

  return { isLoading, error, retry }
}

export { useAsyncData }
export default useAsyncData
