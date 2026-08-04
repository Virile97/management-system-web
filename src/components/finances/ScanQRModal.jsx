"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScanLine, X, AlertCircle } from "lucide-react"

function ScanQRModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ScanLine className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Record Offering
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Step 1 — Scan Member QR Code
          </p>

          <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-[#0a0a0f]" />

          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Camera access denied. Select a member manually below.
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-x-0 h-px bg-border" />
            <span className="relative bg-popover px-3 text-xs text-muted-foreground">
              or select manually
            </span>
          </div>

          <Select>
            <SelectTrigger className="h-10 w-full rounded-lg">
              <SelectValue placeholder="Choose a member..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="margaret-osei">Margaret Osei</SelectItem>
              <SelectItem value="david-asante">David Asante</SelectItem>
              <SelectItem value="grace-mensah">Grace Mensah</SelectItem>
              <SelectItem value="emmanuel-boateng">Emmanuel Boateng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="px-4 pb-6 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-lg"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ScanQRModal }
export default ScanQRModal
