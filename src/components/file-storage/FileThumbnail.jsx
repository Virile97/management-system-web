"use client"

import { useSignedUrlInView } from "@/hooks/use-signed-url-in-view"
import { Skeleton } from "@/components/ui/skeleton"
import fileStorageService from "@/services/fileStorage.service"
import { Image as ImageIcon, FileText, FileType2, Play, Video as VideoIcon } from "lucide-react"

/** Renders the backend-generated thumbnail once ready. Callers fall back to
 * their own live-rendered preview for PENDING/FAILED/NONE — a generated
 * thumbnail is a fast path, not a hard requirement, so a file is never
 * left with no preview at all just because generation hasn't finished or
 * isn't supported for its type (e.g. Word/Excel/PowerPoint — see
 * file-storage.thumbnail.js on the backend). */
function GeneratedThumbnail({ file, className }) {
  const { ref, url, failed } = useSignedUrlInView(file.id, {
    urlFetcher: fileStorageService.getThumbnailUrl,
  })

  if (!url || failed) return <div ref={ref} className={className} />

  return (
    <div ref={ref} className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element -- signed URL is
          short-lived/opaque and not a static asset next/image can optimize */}
      <img src={url} alt="" className="h-full w-full object-cover" />
    </div>
  )
}

/**
 * Full-bleed image preview for a grid card. Signed URLs are short-lived and
 * only ever issued on demand — fetching one for every image the moment the
 * grid renders would mean a Supabase sign call per image on every page
 * load. Instead, this only requests a signed URL once the card actually
 * scrolls into view (see useSignedUrlInView).
 */
function ImageCardPreview({ file }) {
  const { ref, inView, url, failed } = useSignedUrlInView(file.id)

  if (file.thumbnailStatus === "READY") {
    return <GeneratedThumbnail file={file} className="absolute inset-0 z-0" />
  }

  return (
    <div ref={ref} className="absolute inset-0 z-0">
      {url && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed URL is
        // short-lived/opaque and not a static asset next/image can optimize
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={() => {}}
        />
      ) : inView && !failed ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#B45309]/40">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

/**
 * PDF preview for grid cards. `inset` renders inside a padded white panel;
 * `full` fills the entire card (used for other layouts). Prefers the
 * backend-generated first-page thumbnail; falls back to a live PDF iframe
 * if generation hasn't finished, failed, or isn't available.
 */
function PdfCardPreview({ file, variant = "full" }) {
  const { ref, inView, url, failed } = useSignedUrlInView(file.id)
  const inset = variant === "inset"
  const wrapperClassName = inset
    ? "relative h-full min-h-[128px] w-full overflow-hidden rounded-lg bg-white ring-1 ring-black/5"
    : "absolute inset-0 z-0 overflow-hidden bg-white"

  if (file.thumbnailStatus === "READY") {
    return <GeneratedThumbnail file={file} className={wrapperClassName} />
  }

  return (
    <div ref={ref} className={wrapperClassName}>
      {file.thumbnailStatus === "PENDING" ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : url && !failed ? (
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          title=""
          className="pointer-events-none absolute inset-0 h-[125%] w-full border-0"
        />
      ) : inView && !failed ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${
            inset ? "bg-[#FAFAF8] text-[#BE123C]/25" : "bg-[#FFE4E6] text-[#BE123C]/30"
          }`}
        >
          <FileText className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

/** Word/Excel/PowerPoint preview for grid cards. There's no browser-native
 * renderer for these formats (unlike PDF's iframe), so this embeds the same
 * signed URL in Google's public document viewer — the same viewer already
 * used for the full "open" action (see resolveOpenAction's "sheets"/"docs"
 * cases in page.js). `inset` matches PdfCardPreview's panel layout.
 *
 * Not backend-generated yet — Office thumbnails need a document converter
 * (e.g. LibreOffice headless) that isn't available in every deploy
 * environment; thumbnailStatus stays NONE for these (see
 * file-storage.thumbnail.js), so this always uses the live viewer. */
function DocCardPreview({ file, variant = "full" }) {
  const { ref, inView, url, failed } = useSignedUrlInView(file.id)
  const inset = variant === "inset"

  return (
    <div
      ref={ref}
      className={
        inset
          ? "relative h-full min-h-[128px] w-full overflow-hidden rounded-lg bg-white ring-1 ring-black/5"
          : "absolute inset-0 z-0 overflow-hidden bg-white"
      }
    >
      {url && !failed ? (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
          title=""
          className="pointer-events-none absolute inset-0 h-[125%] w-full border-0"
        />
      ) : inView && !failed ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center ${
            inset ? "bg-[#FAFAF8] text-[#1D4ED8]/25" : "bg-[#DBEAFE] text-[#1D4ED8]/30"
          }`}
        >
          <FileType2 className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

/** Video preview for grid cards. Prefers the backend-generated frame
 * thumbnail; falls back to grabbing a frame with the browser's own decoder
 * (muted, no controls) if generation hasn't finished, failed, or the
 * thumbnail service is unavailable. Play icon overlay in both cases so it
 * still reads as a video at a glance. */
function VideoCardPreview({ file }) {
  const { ref, inView, url, failed } = useSignedUrlInView(file.id)

  if (file.thumbnailStatus === "READY") {
    return (
      <div className="absolute inset-0 z-0 bg-black">
        <GeneratedThumbnail file={file} className="absolute inset-0" />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-black shadow">
            <Play className="size-4 fill-current pl-0.5" />
          </span>
        </span>
      </div>
    )
  }

  return (
    <div ref={ref} className="absolute inset-0 z-0 bg-black">
      {file.thumbnailStatus === "PENDING" ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : url && !failed ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- muted
              poster frame only, not a playback surface */}
          <video
            src={`${url}#t=0.1`}
            muted
            preload="metadata"
            className="h-full w-full object-cover"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/90 text-black shadow">
              <Play className="size-4 fill-current pl-0.5" />
            </span>
          </span>
        </>
      ) : inView && !failed ? (
        <Skeleton className="h-full w-full rounded-none" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#6D28D9]/40">
          <VideoIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

export { ImageCardPreview, PdfCardPreview, DocCardPreview, VideoCardPreview }
export default ImageCardPreview
