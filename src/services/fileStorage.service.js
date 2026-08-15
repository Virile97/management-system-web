import { getCsrfHeader } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

function getFileStorageStats(signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_STATS, { signal })
}

async function listFiles(
  {
    folderId,
    type,
    search,
    tag,
    sort = "date",
    order = "desc",
    page = 1,
    limit = 24,
  } = {},
  signal
) {
  const params = new URLSearchParams({
    sort,
    order,
    page: String(page),
    limit: String(limit),
  })
  if (folderId) params.set("folderId", folderId)
  if (type) params.set("type", type)
  if (search) params.set("search", search)
  if (tag) params.set("tag", tag)

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.FILE_STORAGE_LIST}?${params}`,
    { signal }
  )
  return { data, meta }
}

function uploadFile({ file, folderId, tags }, signal) {
  const formData = new FormData()
  formData.append("file", file)
  if (folderId) formData.append("folderId", folderId)
  if (tags?.length) formData.append("tags", tags.join(","))

  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_UPLOAD, {
    method: "POST",
    headers: { ...getCsrfHeader() },
    body: formData,
    signal,
  })
}

/** By default returns an inline-viewable signed URL (no Content-Disposition:
 * attachment) — required for thumbnails, previews, and viewer embeds, which
 * silently download instead of rendering if this is ever forced. Pass
 * `{ forceDownload: true }` only for an actual "download this file" action. */
function getDownloadUrl(id, { forceDownload = false, signal } = {}) {
  const query = forceDownload ? "?download=true" : ""
  return fetchJson(`${APP_API_ENDPOINTS.FILE_STORAGE_DOWNLOAD(id)}${query}`, { signal })
}

function listFolders({ folderId } = {}, signal) {
  const params = new URLSearchParams()
  if (folderId) params.set("folderId", folderId)
  const query = params.toString()
  return fetchJson(
    `${APP_API_ENDPOINTS.FILE_STORAGE_FOLDERS}${query ? `?${query}` : ""}`,
    { signal }
  )
}

function createFolder({ name, parentId }, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_FOLDERS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ name, parentId }),
    signal,
  })
}

function renameFolder(id, name, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_FOLDER_BY_ID(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ name }),
    signal,
  })
}

function deleteFolder(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_FOLDER_BY_ID(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

function renameFile(id, { name, tags }, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_BY_ID(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ name, tags }),
    signal,
  })
}

function moveFile(id, folderId, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_MOVE(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ folderId }),
    signal,
  })
}

function deleteFile(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_BY_ID(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

function getFolderBreadcrumb(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_FOLDER_BREADCRUMB(id), { signal })
}

/** Flat list of every archived file/folder, most-recently-archived first.
 * Each item carries an `itemType: "file" | "folder"` field. */
function listArchived(signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_ARCHIVE, { signal })
}

function restoreFile(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_RESTORE(id), {
    method: "POST",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

function permanentlyDeleteFile(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_PERMANENT_DELETE(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

function restoreFolder(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_FOLDER_RESTORE(id), {
    method: "POST",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

function permanentlyDeleteFolder(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_FOLDER_PERMANENT_DELETE(id), {
    method: "DELETE",
    headers: { ...getCsrfHeader() },
    signal,
  })
}

async function listAllFilesInFolder(folderId, signal) {
  const collected = []

  async function walk(currentFolderId) {
    let page = 1
    let totalPages = 1

    do {
      const { data, meta } = await listFiles(
        { folderId: currentFolderId, page, limit: 100 },
        signal
      )
      if (data?.length) collected.push(...data)
      totalPages = meta?.totalPages || 1
      page += 1
    } while (page <= totalPages)

    const subfolders = await listFolders({ folderId: currentFolderId }, signal)
    for (const subfolder of subfolders || []) {
      await walk(subfolder.id)
    }
  }

  await walk(folderId)
  return collected
}

export {
  getFileStorageStats,
  listFiles,
  uploadFile,
  getDownloadUrl,
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  renameFile,
  moveFile,
  deleteFile,
  getFolderBreadcrumb,
  listAllFilesInFolder,
  listArchived,
  restoreFile,
  permanentlyDeleteFile,
  restoreFolder,
  permanentlyDeleteFolder,
}
export default {
  getFileStorageStats,
  listFiles,
  uploadFile,
  getDownloadUrl,
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  renameFile,
  moveFile,
  deleteFile,
  getFolderBreadcrumb,
  listAllFilesInFolder,
  listArchived,
  restoreFile,
  permanentlyDeleteFile,
  restoreFolder,
  permanentlyDeleteFolder,
}
