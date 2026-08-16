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
import { SelectionActionBar } from "@/components/file-storage/SelectionActionBar"
import { FilePreviewModal } from "@/components/file-storage/FilePreviewModal"
import { FileInfoModal } from "@/components/file-storage/FileInfoModal"
import { RenameItemModal } from "@/components/file-storage/RenameItemModal"
import { ArchiveView } from "@/components/file-storage/ArchiveView"
import { PermanentDeleteConfirmModal } from "@/components/file-storage/PermanentDeleteConfirmModal"
import {
  FILE_TYPE_OPTIONS,
  SORT_FIELD_DEFAULT_ORDER,
  resolveOpenAction,
} from "@/components/file-storage/file-storage.constants"

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
  const [isBulkActionBusy, setIsBulkActionBusy] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [infoItem, setInfoItem] = useState(null)
  const [infoKind, setInfoKind] = useState(null)
  const [renameItem, setRenameItem] = useState(null)
  const [renameKind, setRenameKind] = useState(null)
  const [isArchiveView, setIsArchiveView] = useState(false)
  const [archivedItems, setArchivedItems] = useState([])
  const [isArchiveLoading, setIsArchiveLoading] = useState(true)
  const [archiveBusyKey, setArchiveBusyKey] = useState(null)
  const [permanentDeleteItem, setPermanentDeleteItem] = useState(null)
  const [isPermanentDeleteBusy, setIsPermanentDeleteBusy] = useState(false)
  const [permanentDeleteError, setPermanentDeleteError] = useState("")
  const [draggedFile, setDraggedFile] = useState(null)
  // Keyed "file:<id>" / "folder:<id>" so files and folders share one
  // selection set without id collisions.
  const [selectedKeys, setSelectedKeys] = useState(() => new Set())

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

  const loadArchive = useCallback(async (signal) => {
    setIsArchiveLoading(true)
    try {
      const data = await fileStorageService.listArchived(signal)
      if (!signal?.aborted) setArchivedItems(data || [])
    } catch (err) {
      if (signal?.aborted || err?.name === "AbortError") return
      toast.error(err?.message || "Unable to load archive")
    } finally {
      if (!signal?.aborted) setIsArchiveLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isArchiveView) return
    const controller = new AbortController()
    loadArchive(controller.signal)
    return () => controller.abort()
  }, [isArchiveView, loadArchive])

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

  // Selections don't carry meaning across navigation — clear them whenever
  // the visible set of files/folders changes (folder nav, type filter).
  useEffect(() => {
    setSelectedKeys(new Set())
  }, [currentFolderId, activeTypeFilter])

  function refresh() {
    loadFiles()
    loadStats()
    loadFolders()
  }

  const allKeys = [
    ...folders.map((folder) => `folder:${folder.id}`),
    ...files.map((file) => `file:${file.id}`),
  ]
  const allSelected = allKeys.length > 0 && selectedKeys.size === allKeys.length
  const someSelected = selectedKeys.size > 0 && !allSelected

  function toggleSelectAll() {
    setSelectedKeys(allSelected ? new Set() : new Set(allKeys))
  }

  function toggleSelect(key) {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function clearSelection() {
    setSelectedKeys(new Set())
  }

  function selectedKeysByType() {
    const fileIds = []
    const folderIds = []
    for (const key of selectedKeys) {
      const [type, id] = key.split(":")
      if (type === "file") fileIds.push(id)
      else if (type === "folder") folderIds.push(id)
    }
    return { fileIds, folderIds }
  }

  async function handleBulkDownload() {
    const { fileIds, folderIds } = selectedKeysByType()
    if (fileIds.length === 0) {
      toast.error("Folders can't be downloaded — select individual files")
      return
    }

    setIsBulkActionBusy(true)
    try {
      for (const id of fileIds) {
        // eslint-disable-next-line no-await-in-loop -- sequential on purpose,
        // so the browser doesn't get dozens of simultaneous popup/downloads
        // at once (and some browsers block rapid-fire window.open bursts).
        const { url } = await fileStorageService.getDownloadUrl(id, {
          forceDownload: true,
        })
        window.open(url, "_blank", "noopener,noreferrer")
      }
      if (folderIds.length > 0) {
        toast.info("Folders were skipped — only files can be downloaded")
      }
    } catch (err) {
      toast.error(err?.message || "Unable to download selected files")
    } finally {
      setIsBulkActionBusy(false)
    }
  }

  async function handleBulkDelete() {
    const { fileIds, folderIds } = selectedKeysByType()
    if (fileIds.length === 0 && folderIds.length === 0) return

    setIsBulkActionBusy(true)
    try {
      const results = await Promise.allSettled([
        ...fileIds.map((id) => fileStorageService.deleteFile(id)),
        ...folderIds.map((id) => fileStorageService.deleteFolder(id)),
      ])
      const failed = results.filter((r) => r.status === "rejected")
      const succeeded = results.length - failed.length

      if (succeeded > 0) {
        toast.success(`Moved ${succeeded} item${succeeded === 1 ? "" : "s"} to Archive`)
      }
      if (failed.length > 0) {
        toast.error(
          `${failed.length} item${failed.length === 1 ? "" : "s"} could not be archived`
        )
      }

      clearSelection()
      refresh()
    } finally {
      setIsBulkActionBusy(false)
    }
  }

  async function handleFileClick(file) {
    const action = resolveOpenAction(file)
    // The preview modal fetches its own signed URL (and re-fetches as the
    // user navigates the slider), so it doesn't need one from here.
    if (action === "preview") {
      setPreviewFile(file)
      return
    }

    setBusyFileId(file.id)
    try {
      // Only an actual "download" forces Content-Disposition: attachment —
      // pdf/sheets/docs all need an inline URL or the browser downloads the
      // file instead of rendering/embedding it.
      const { url } = await fileStorageService.getDownloadUrl(file.id, {
        forceDownload: action === "download",
      })

      if (action === "sheets" || action === "docs") {
        window.open(
          `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
          "_blank",
          "noopener,noreferrer"
        )
        return
      }
      // PDF renders natively in a new tab; "download" opens the
      // attachment-disposition URL, which the browser saves directly.
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

  async function handleFileDownload(file) {
    setBusyFileId(file.id)
    try {
      const { url } = await fileStorageService.getDownloadUrl(file.id, {
        forceDownload: true,
      })
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      toast.error(err?.message || "Unable to download file")
    } finally {
      setBusyFileId(null)
    }
  }

  async function handleCopyFileLink(file) {
    try {
      const { url } = await fileStorageService.getDownloadUrl(file.id)
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch (err) {
      toast.error(err?.message || "Unable to copy link")
    }
  }

  async function handleShareFile(file) {
    try {
      const { url } = await fileStorageService.getDownloadUrl(file.id)
      if (navigator.share) {
        await navigator.share({ title: file.name, url })
        return
      }
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    } catch (err) {
      if (err?.name === "AbortError") return
      toast.error(err?.message || "Unable to share file")
    }
  }

  async function handleFolderDownload(folder) {
    try {
      const files = await fileStorageService.listAllFilesInFolder(folder.id)
      if (files.length === 0) {
        toast.success(`${folder.name} is empty`)
        return
      }

      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop -- sequential downloads
        // avoid browsers blocking rapid popup bursts
        const { url } = await fileStorageService.getDownloadUrl(file.id, {
          forceDownload: true,
        })
        window.open(url, "_blank", "noopener,noreferrer")
      }

      toast.success(
        `Downloading ${files.length} file${files.length === 1 ? "" : "s"} from ${folder.name}`
      )
    } catch (err) {
      toast.error(err?.message || "Unable to download folder")
    }
  }

  // Drag-to-move: only files can be dragged onto a folder to move them in —
  // there's no folder-move endpoint (only FILE_STORAGE_MOVE), so dropping a
  // folder onto another folder is intentionally not wired up.
  function handleItemDragStart(event, file) {
    event.dataTransfer.effectAllowed = "move"
    setDraggedFile(file)
  }

  function handleItemDragEnd() {
    setDraggedFile(null)
  }

  async function handleDropOnFolder(targetFolder) {
    const file = draggedFile
    setDraggedFile(null)
    if (!file || file.folderId === targetFolder.id) return

    try {
      await fileStorageService.moveFile(file.id, targetFolder.id)
      toast.success(`Moved "${file.name}" to ${targetFolder.name}`)
      refresh()
    } catch (err) {
      toast.error(err?.message || "Unable to move file")
    }
  }

  async function handleRenameConfirm({ name }) {
    if (!renameItem) return

    if (renameKind === "file") {
      await fileStorageService.renameFile(renameItem.id, { name })
      toast.success("File renamed")
    } else {
      await fileStorageService.renameFolder(renameItem.id, name)
      toast.success("Folder renamed")
    }

    refresh()
  }

  async function handleArchiveFile(file) {
    try {
      await fileStorageService.deleteFile(file.id)
      toast.success(`Moved "${file.name}" to Archive`)
      clearSelection()
      refresh()
    } catch (err) {
      toast.error(err?.message || "Unable to archive file")
    }
  }

  async function handleArchiveFolder(folder) {
    try {
      await fileStorageService.deleteFolder(folder.id)
      toast.success(`Moved "${folder.name}" to Archive`)
      clearSelection()
      refresh()
    } catch (err) {
      toast.error(err?.message || "Unable to archive folder")
    }
  }

  function openArchiveView() {
    setIsArchiveView(true)
    clearSelection()
  }

  function exitArchiveView() {
    setIsArchiveView(false)
  }

  async function handleRestoreArchivedItem(item) {
    const key = `${item.itemType}:${item.id}`
    setArchiveBusyKey(key)
    try {
      if (item.itemType === "folder") {
        await fileStorageService.restoreFolder(item.id)
      } else {
        await fileStorageService.restoreFile(item.id)
      }
      toast.success(`Restored "${item.name}"`)
      setArchivedItems((prev) => prev.filter((i) => `${i.itemType}:${i.id}` !== key))
      loadStats()
    } catch (err) {
      toast.error(err?.message || "Unable to restore item")
    } finally {
      setArchiveBusyKey(null)
    }
  }

  function requestPermanentDelete(item) {
    setPermanentDeleteError("")
    setPermanentDeleteItem(item)
  }

  async function handleConfirmPermanentDelete() {
    if (!permanentDeleteItem) return
    const item = permanentDeleteItem
    const key = `${item.itemType}:${item.id}`

    setIsPermanentDeleteBusy(true)
    setPermanentDeleteError("")
    try {
      if (item.itemType === "folder") {
        await fileStorageService.permanentlyDeleteFolder(item.id)
      } else {
        await fileStorageService.permanentlyDeleteFile(item.id)
      }
      toast.success(`"${item.name}" permanently deleted`)
      setArchivedItems((prev) => prev.filter((i) => `${i.itemType}:${i.id}` !== key))
      setPermanentDeleteItem(null)
    } catch (err) {
      setPermanentDeleteError(err?.message || "Unable to permanently delete item")
    } finally {
      setIsPermanentDeleteBusy(false)
    }
  }

  function handleFileAction(action, file) {
    switch (action) {
      case "download":
        handleFileDownload(file)
        break
      case "open":
        handleFileClick(file)
        break
      case "rename":
        setRenameItem(file)
        setRenameKind("file")
        break
      case "info":
        setInfoItem(file)
        setInfoKind("file")
        break
      case "copyLink":
        handleCopyFileLink(file)
        break
      case "share":
        handleShareFile(file)
        break
      case "archive":
        handleArchiveFile(file)
        break
      default:
        break
    }
  }

  function handleFolderAction(action, folder) {
    switch (action) {
      case "open":
        handleFolderClick(folder)
        break
      case "download":
        handleFolderDownload(folder)
        break
      case "rename":
        setRenameItem(folder)
        setRenameKind("folder")
        break
      case "info":
        setInfoItem(folder)
        setInfoKind("folder")
        break
      case "share":
        toast.info("Folder sharing is coming soon")
        break
      case "archive":
        handleArchiveFolder(folder)
        break
      default:
        break
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
    if (!isAdmin || draggedFile) return
    event.preventDefault()
    setIsPageDragging(true)
  }

  function handlePageDragOver(event) {
    if (!isAdmin || draggedFile) return
    event.preventDefault()
  }

  function handlePageDragLeave(event) {
    if (!isAdmin || draggedFile) return
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsPageDragging(false)
  }

  function handlePageDrop(event) {
    if (!isAdmin || draggedFile) return
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
        onTypeChange={(type) => {
          exitArchiveView()
          handleTypeChange(type)
        }}
        stats={stats}
        isArchiveView={isArchiveView}
        onArchiveClick={openArchiveView}
        archiveCount={archivedItems.length}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 md:px-8 ${
          selectedKeys.size > 0 ? "pb-24" : ""
        }`}
      >
        {error ? (
          <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <FileStorageHeader
          search={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(value) =>
            setSort(value, SORT_FIELD_DEFAULT_ORDER[value] || "desc")
          }
          onToggleSortOrder={() =>
            setSort(sortBy, sortOrder === "asc" ? "desc" : "asc")
          }
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewFolder={() => setNewFolderOpen(true)}
          onUploadType={openUploadForType}
          canManage={isAdmin}
        />

        {isArchiveView ? (
          <>
            <div>
              <h2 className="text-base font-semibold text-foreground">Archive</h2>
              <p className="text-sm text-muted-foreground">
                Deleted files and folders — restore them or delete permanently.
              </p>
            </div>

            <ArchiveView
              items={archivedItems}
              isLoading={isArchiveLoading}
              busyKey={archiveBusyKey}
              onRestore={handleRestoreArchivedItem}
              onPermanentDelete={requestPermanentDelete}
            />
          </>
        ) : (
          <>
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

            {selectedKeys.size > 0 ? (
              <SelectionActionBar
                count={selectedKeys.size}
                onDownload={handleBulkDownload}
                onDelete={handleBulkDelete}
                onClear={clearSelection}
                onSelectAll={toggleSelectAll}
                allSelected={allSelected}
                isBusy={isBulkActionBusy}
              />
            ) : null}

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
                selectedKeys={selectedKeys}
                onToggleSelect={toggleSelect}
                allSelected={allSelected}
                someSelected={someSelected}
                onToggleSelectAll={toggleSelectAll}
                onFileAction={handleFileAction}
                onFolderAction={handleFolderAction}
                canMove={isAdmin}
                onDragItemStart={handleItemDragStart}
                onDragItemEnd={handleItemDragEnd}
                onDropItemInFolder={handleDropOnFolder}
              />
            ) : (
              <FileListView
                files={files}
                folders={folders}
                onFileClick={handleFileClick}
                onFolderClick={handleFolderClick}
                isLoading={isLoading}
                busyFileId={busyFileId}
                selectedKeys={selectedKeys}
                onToggleSelect={toggleSelect}
                allSelected={allSelected}
                someSelected={someSelected}
                onToggleSelectAll={toggleSelectAll}
              />
            )}
          </>
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
      <FilePreviewModal
        open={Boolean(previewFile)}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null)
        }}
        file={previewFile}
        files={files}
        onFileAction={handleFileAction}
      />
      <FileInfoModal
        open={Boolean(infoItem)}
        onOpenChange={(open) => {
          if (!open) {
            setInfoItem(null)
            setInfoKind(null)
          }
        }}
        item={infoItem}
        kind={infoKind}
      />
      <RenameItemModal
        open={Boolean(renameItem)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameItem(null)
            setRenameKind(null)
          }
        }}
        title={renameKind === "folder" ? "Rename folder" : "Rename file"}
        label={renameKind === "folder" ? "Folder name" : "File name"}
        initialName={renameItem?.name || ""}
        onConfirm={handleRenameConfirm}
      />
      <PermanentDeleteConfirmModal
        open={Boolean(permanentDeleteItem)}
        onOpenChange={(open) => {
          if (!open) {
            setPermanentDeleteItem(null)
            setPermanentDeleteError("")
          }
        }}
        item={permanentDeleteItem}
        onConfirm={handleConfirmPermanentDelete}
        isBusy={isPermanentDeleteBusy}
        error={permanentDeleteError}
      />
    </div>
  )
}
