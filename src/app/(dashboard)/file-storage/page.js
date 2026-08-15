"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { UploadCloud } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { useDebounce } from "@/hooks/use-debounce"
import { useFileStorageStore } from "@/stores/fileStorage.store"
import fileStorageService from "@/services/fileStorage.service"
import { BrowseSidebar } from "@/components/file-storage/BrowseSidebar"
import { FileStorageHeader } from "@/components/file-storage/FileStorageHeader"
import { FileGrid } from "@/components/file-storage/FileGrid"
import { FileListView } from "@/components/file-storage/FileListView"
import { UploadFileModal } from "@/components/file-storage/UploadFileModal"
import { NewFolderModal } from "@/components/file-storage/NewFolderModal"
import { FileStoragePageSkeleton } from "@/components/file-storage/FileStorageSkeletons"
import { FILE_TYPE_OPTIONS } from "@/components/file-storage/file-storage.constants"

function sectionLabel(activeType) {
  if (!activeType) return "All Files"
  return FILE_TYPE_OPTIONS.find((o) => o.value === activeType)?.label || "Files"
}

export default function FileStoragePage() {
  const [user, setUser] = useState(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState(null)
  const [droppedFile, setDroppedFile] = useState(null)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [busyFileId, setBusyFileId] = useState(null)
  const [isPageDragging, setIsPageDragging] = useState(false)

  const {
    files,
    folders,
    isLoading,
    error,
    stats,
    isStatsLoading,
    currentFolderId,
    breadcrumb,
    activeTypeFilter,
    searchQuery,
    sortBy,
    sortOrder,
    viewMode,
    setFiles,
    setFolders,
    setLoading,
    setError,
    setStats,
    setStatsLoading,
    setTypeFilter,
    setSearchQuery,
    setSort,
    setViewMode,
    setCurrentFolder,
  } = useFileStorageStore()

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const isAdmin = user?.role === "ADMIN"

  const loadFiles = useCallback(
    async (signal) => {
      setLoading(true)
      setError("")
      try {
        const query = {
          folderId: currentFolderId || undefined,
          type: activeTypeFilter || undefined,
          search: debouncedSearch || undefined,
          sort: sortBy,
          order: sortOrder,
        }
        const { data, meta } = await fileStorageService.listFiles(query, signal)
        if (!signal?.aborted) setFiles(data || [], meta, query)
      } catch (err) {
        if (signal?.aborted || err?.name === "AbortError") return
        setError(err?.message || "Unable to load files")
        setFiles([], { total: 0, totalPages: 1 }, null)
      }
    },
    [
      currentFolderId,
      activeTypeFilter,
      debouncedSearch,
      sortBy,
      sortOrder,
      setFiles,
      setLoading,
      setError,
    ]
  )

  const loadStats = useCallback(
    async (signal) => {
      setStatsLoading(true)
      try {
        const data = await fileStorageService.getFileStorageStats(signal)
        if (!signal?.aborted) setStats(data)
      } catch (err) {
        if (signal?.aborted || err?.name === "AbortError") return
      }
    },
    [setStats, setStatsLoading]
  )

  // Folders are a navigation concept, not a "file type" — when browsing a
  // type filter (Videos, PDFs, ...) show a flat file list only, no
  // subfolders, matching how the sidebar's type rows behave.
  const loadFolders = useCallback(
    async (signal) => {
      if (activeTypeFilter) {
        setFolders([])
        return
      }
      try {
        const data = await fileStorageService.listFolders(
          { folderId: currentFolderId || undefined },
          signal
        )
        if (!signal?.aborted) setFolders(data || [])
      } catch (err) {
        if (signal?.aborted || err?.name === "AbortError") return
      }
    },
    [currentFolderId, activeTypeFilter, setFolders]
  )

  useEffect(() => {
    const controller = new AbortController()
    loadFiles(controller.signal)
    return () => controller.abort()
  }, [loadFiles])

  useEffect(() => {
    const controller = new AbortController()
    loadStats(controller.signal)
    return () => controller.abort()
  }, [loadStats])

  useEffect(() => {
    const controller = new AbortController()
    loadFolders(controller.signal)
    return () => controller.abort()
  }, [loadFolders])

  function refresh() {
    loadFiles()
    loadStats()
    loadFolders()
  }

  async function handleFileClick(file) {
    setBusyFileId(file.id)
    try {
      const { url } = await fileStorageService.getDownloadUrl(file.id)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      toast.error(err?.message || "Unable to open file")
    } finally {
      setBusyFileId(null)
    }
  }

  async function handleUpload({ file, folderId, tags }) {
    await fileStorageService.uploadFile({ file, folderId, tags })
    toast.success("File uploaded")
    refresh()
  }

  async function handleCreateFolder({ name }) {
    await fileStorageService.createFolder({ name, parentId: currentFolderId })
    toast.success("Folder created")
    refresh()
  }

  async function handleFolderClick(folder) {
    try {
      const crumb = await fileStorageService.getFolderBreadcrumb(folder.id)
      setCurrentFolder(folder.id, crumb || [])
    } catch (err) {
      toast.error(err?.message || "Unable to open folder")
    }
  }

  function goToBreadcrumb(folderId) {
    if (!folderId) {
      setCurrentFolder(null, [])
      return
    }
    const index = breadcrumb.findIndex((crumb) => crumb.id === folderId)
    setCurrentFolder(folderId, index >= 0 ? breadcrumb.slice(0, index + 1) : [])
  }

  // Sidebar type filters search the whole library, not the current folder
  // — leaving currentFolderId set while filtering by type would silently
  // scope results in a way the sidebar gives no indication of.
  function handleTypeChange(type) {
    setCurrentFolder(null, [])
    setTypeFilter(type)
  }

  function openUploadForType(type) {
    setUploadType(type)
    setDroppedFile(null)
    setUploadOpen(true)
  }

  function handlePageDragEnter(event) {
    if (!isAdmin) return
    event.preventDefault()
    setIsPageDragging(true)
  }

  function handlePageDragOver(event) {
    if (!isAdmin) return
    event.preventDefault()
  }

  function handlePageDragLeave(event) {
    if (!isAdmin) return
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsPageDragging(false)
  }

  function handlePageDrop(event) {
    if (!isAdmin) return
    event.preventDefault()
    setIsPageDragging(false)
    const file = event.dataTransfer?.files?.[0]
    if (!file) return
    setUploadType(null)
    setDroppedFile(file)
    setUploadOpen(true)
  }

  if (isLoading && files.length === 0 && isStatsLoading) {
    return (
      <div className="flex min-h-full bg-[#FAFAF8]">
        <FileStoragePageSkeleton />
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-full bg-[#FAFAF8]"
      onDragEnter={handlePageDragEnter}
      onDragOver={handlePageDragOver}
      onDragLeave={handlePageDragLeave}
      onDrop={handlePageDrop}
    >
      {isPageDragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-[#1e2a4a]/10 backdrop-blur-[1px]">
          <div className="rounded-2xl bg-white px-6 py-4 text-sm font-medium text-foreground ring-1 ring-[#E5E4E0]">
            Drop to upload
          </div>
        </div>
      )}

      <BrowseSidebar
        counts={stats?.countsByType}
        activeType={activeTypeFilter}
        onTypeChange={handleTypeChange}
        stats={stats}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 md:px-8">
        {error ? (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <FileStorageHeader
          search={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={(value) => setSort(value, sortOrder)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewFolder={() => setNewFolderOpen(true)}
          onUploadType={openUploadForType}
          canManage={isAdmin}
        />

        {breadcrumb.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => goToBreadcrumb(null)}
              className="hover:text-foreground hover:underline"
            >
              All Files
            </button>
            {breadcrumb.map((crumb) => (
              <span key={crumb.id} className="flex items-center gap-1">
                <span>/</span>
                <button
                  type="button"
                  onClick={() => goToBreadcrumb(crumb.id)}
                  className="hover:text-foreground hover:underline"
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-sm font-medium text-foreground/85">
          {sectionLabel(activeTypeFilter)} ({files.length} files)
        </p>

        {viewMode === "grid" ? (
          <FileGrid
            files={files}
            folders={folders}
            onFileClick={handleFileClick}
            onFolderClick={handleFolderClick}
            isLoading={isLoading}
            busyFileId={busyFileId}
          />
        ) : (
          <FileListView
            files={files}
            onFileClick={handleFileClick}
            isLoading={isLoading}
            busyFileId={busyFileId}
          />
        )}

        {isAdmin && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <UploadCloud className="h-4 w-4 shrink-0 opacity-70" />
            <span>Drag and drop files anywhere to upload</span>
          </div>
        )}
      </div>

      <UploadFileModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        initialType={uploadType}
        initialFile={droppedFile}
        currentFolderId={currentFolderId}
        onConfirm={handleUpload}
      />
      <NewFolderModal
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onConfirm={handleCreateFolder}
      />
    </div>
  )
}
