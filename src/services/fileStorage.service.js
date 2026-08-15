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

function getDownloadUrl(id, signal) {
  return fetchJson(APP_API_ENDPOINTS.FILE_STORAGE_DOWNLOAD(id), { signal })
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
}
