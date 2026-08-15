"use client"

import { useSignedUrlInView } from "@/hooks/use-signed-url-in-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Image as ImageIcon, FileText } from "lucide-react"

/**
 * Full-bleed image preview for a grid card. Signed URLs are short-lived and
 * only ever issued on demand — fetching one for every image the moment the
 * grid renders would mean a Supabase sign call per image on every page
 * load. Instead, this only requests a signed URL once the card actually
 * scrolls into view (see useSignedUrlInView).
 */
function ImageCardPreview({ file }) {
  const { ref, inView, url, failed } = useSignedUrlInView(file.id)

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
 * `full` fills the entire card (used for other layouts).
 */
function PdfCardPreview({ file, variant = "full" }) {
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

export { ImageCardPreview, PdfCardPreview }
export default ImageCardPreview
