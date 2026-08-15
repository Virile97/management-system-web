import { Video, Music, FileText, Image, FileType2, File, Archive } from "lucide-react"

export const FILE_TYPE_OPTIONS = [
  { value: "VIDEO", label: "Videos", icon: Video },
  { value: "AUDIO", label: "Audio", icon: Music },
  { value: "PDF", label: "PDFs", icon: FileText },
  { value: "IMAGE", label: "Images", icon: Image },
  { value: "DOCUMENT", label: "Documents", icon: FileType2 },
  { value: "OTHER", label: "Others", icon: File },
]

export const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
]

export const UPLOAD_MENU_ITEMS = [
  { type: "VIDEO", label: "Video", icon: Video, accept: "video/*", iconClassName: "bg-[#EDE9FE] text-[#6D28D9]" },
  { type: "AUDIO", label: "Audio", icon: Music, accept: "audio/*", iconClassName: "bg-[#D1FAE5] text-[#047857]" },
  { type: "PDF", label: "PDF", icon: FileText, accept: "application/pdf", iconClassName: "bg-[#FFE4E6] text-[#BE123C]" },
  { type: "IMAGE", label: "Image", icon: Image, accept: "image/*", iconClassName: "bg-[#FEF3C7] text-[#B45309]" },
  {
    type: "DOCUMENT",
    label: "Document",
    icon: FileType2,
    accept:
      ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/csv,text/plain",
    iconClassName: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  { type: "OTHER", label: "Other", icon: Archive, accept: undefined, iconClassName: "bg-[#F1F5F9] text-[#64748B]" },
]

/** Colored chip per type. Label is derived from the file extension where the
 * screenshot shows a specific format (MP4/MP3/DOC), falling back to the
 * generic type label otherwise. */
const EXTENSION_LABELS = {
  mp4: "MP4",
  mov: "MOV",
  webm: "WEBM",
  avi: "AVI",
  mkv: "MKV",
  mp3: "MP3",
  wav: "WAV",
  m4a: "M4A",
  ogg: "OGG",
  pdf: "PDF",
  jpg: "IMG",
  jpeg: "IMG",
  png: "IMG",
  gif: "IMG",
  webp: "IMG",
  svg: "IMG",
  doc: "DOC",
  docx: "DOC",
  xls: "XLS",
  xlsx: "XLS",
  ppt: "PPT",
  pptx: "PPT",
  csv: "CSV",
  txt: "TXT",
  zip: "ZIP",
}

const TYPE_BADGE_CLASSES = {
  VIDEO: "bg-[#EDE9FE] text-[#6D28D9]",
  AUDIO: "bg-[#D1FAE5] text-[#047857]",
  PDF: "bg-[#FFE4E6] text-[#BE123C]",
  IMAGE: "bg-[#FEF3C7] text-[#B45309]",
  DOCUMENT: "bg-[#DBEAFE] text-[#1D4ED8]",
  OTHER: "bg-[#F1F5F9] text-[#64748B]",
}

const TYPE_FALLBACK_LABELS = {
  VIDEO: "MP4",
  AUDIO: "MP3",
  PDF: "PDF",
  IMAGE: "IMG",
  DOCUMENT: "DOC",
  OTHER: "FILE",
}

export function getFileTypeBadge({ fileType, originalName }) {
  const ext = String(originalName || "").split(".").pop()?.toLowerCase()
  const label = EXTENSION_LABELS[ext] || TYPE_FALLBACK_LABELS[fileType] || "FILE"
  const className = TYPE_BADGE_CLASSES[fileType] || TYPE_BADGE_CLASSES.OTHER
  return { label, className }
}

export const MAX_UPLOAD_MB = 500

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
]

export function formatBytes(bytes) {
  const value = Number(bytes) || 0
  if (value === 0) return "0 KB"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const exponent = Math.min(
    units.length - 1,
    Math.floor(Math.log(value) / Math.log(1024))
  )
  const size = value / 1024 ** exponent
  const formatted =
    exponent === 0 || Number.isInteger(size)
      ? String(Math.round(size))
      : size.toFixed(1)
  return `${formatted} ${units[exponent]}`
}
