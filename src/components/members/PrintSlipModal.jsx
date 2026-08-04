"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MemberOfferingSlip } from "@/components/members/MemberOfferingSlip"
import { PrintPortal } from "@/components/common/PrintPortal"
import { useSlipConfig } from "@/components/settings/SlipConfigContext"
import { Printer, X } from "lucide-react"

function PrintSlipModal({ open, onOpenChange, member }) {
  const { branding, qr, fields } = useSlipConfig()

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] w-136 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-136"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Printer className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Print Offering Slip
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
          <MemberOfferingSlip member={member} branding={branding} qr={qr} fields={fields} />
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
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>

      <PrintPortal>
        <div className="print-slip-page">
          <div className="grid grid-cols-5 gap-1.5">
            <MemberOfferingSlip member={member} branding={branding} qr={qr} fields={fields} size="print" />
          </div>
        </div>
      </PrintPortal>
    </Dialog>
  )
}

export { PrintSlipModal }
export default PrintSlipModal
