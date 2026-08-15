"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function PermanentDeleteConfirmModal({ open, onOpenChange, item, onConfirm, isBusy, error }) {
  const label = item?.itemType === "folder" ? "folder" : "file"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this {label} permanently?</DialogTitle>
          <DialogDescription>
            {item?.name ? `"${item.name}" ` : "This item "}
            will be permanently deleted{item?.itemType === "folder" ? " along with everything inside it" : ""}. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? "Deleting…" : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PermanentDeleteConfirmModal }
export default PermanentDeleteConfirmModal
