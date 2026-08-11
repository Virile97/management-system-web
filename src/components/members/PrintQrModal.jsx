"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MemberQrCard } from "@/components/members/MemberQrCard"
import { PrintPortal } from "@/components/common/PrintPortal"
import { QrCode, X } from "lucide-react"

function PrintQrModal({ open, onOpenChange, member }) {
  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] w-md max-w-[calc(100%-2rem)] flex-col gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <QrCode className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Print Member QR
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

        <div className="bg-muted/50 p-4 sm:p-6">
          <div className="mx-auto max-w-64">
            <MemberQrCard member={member} />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Prints in the top-left corner of short bond to save paper.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg px-5"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
            onClick={() => window.print()}
          >
            <QrCode className="h-4 w-4" />
            Print QR
          </Button>
        </div>
      </DialogContent>

      <PrintPortal>
        <div className="print-report-page print-qr-single">
          <MemberQrCard member={member} size="print" className="w-[1.75in]" />
        </div>
      </PrintPortal>
    </Dialog>
  )
}

export { PrintQrModal }
export default PrintQrModal
