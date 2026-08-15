"use client"

import { FileStorageToolbar } from "./FileStorageToolbar"

function FileStorageHeader({
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  onToggleSortOrder,
  viewMode,
  onViewModeChange,
  onNewFolder,
  onUploadType,
  canManage,
}) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="shrink-0">
        <h1 className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight text-foreground">
          File Storage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage videos, audio, documents and more
        </p>
      </div>

      <FileStorageToolbar
        search={search}
        onSearchChange={onSearchChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        onToggleSortOrder={onToggleSortOrder}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onNewFolder={onNewFolder}
        onUploadType={onUploadType}
        canManage={canManage}
      />
    </div>
  )
}

export { FileStorageHeader }
export default FileStorageHeader
