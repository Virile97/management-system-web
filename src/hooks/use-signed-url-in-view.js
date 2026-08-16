import { useEffect, useState } from "react"
import { useInView } from "@/hooks/use-in-view"
import fileStorageService from "@/services/fileStorage.service"

/**
 * Fetches a signed URL for a file, but only once the calling component has
 * scrolled into view — used by grid-card previews so a Supabase sign call
 * isn't fired for every card the moment the grid renders, only for the ones
 * actually visible. Defaults to the original file's download URL; pass
 * `urlFetcher: fileStorageService.getThumbnailUrl` to fetch the generated
 * thumbnail instead.
 */
function useSignedUrlInView(fileId, { urlFetcher = fileStorageService.getDownloadUrl } = {}) {
  const [ref, inView] = useInView()
  const [url, setUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!inView || url || failed) return

    let cancelled = false
    const controller = new AbortController()

    Promise.resolve(urlFetcher(fileId, { signal: controller.signal }))
      .then((data) => {
        if (!cancelled) setUrl(data?.url || null)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [inView, url, failed, fileId, urlFetcher])

  return { ref, inView, url, failed }
}

export { useSignedUrlInView }
export default useSignedUrlInView
