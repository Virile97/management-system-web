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

// 3×4 grid on short bond keeps each sticker large enough to scan while
// fitting a useful batch per page.
const QRS_PER_PAGE = 12

function chunk(list, size) {
  const chunks = []
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size))
  }
  return chunks
}

function PrintSelectedQrModal({ open, onOpenChange, members }) {
  const pages = chunk(members, QRS_PER_PAGE)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-5xl"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <QrCode className="h-5 w-5 shrink-0 text-white" />
            <DialogTitle className="truncate font-heading text-base font-normal text-white sm:text-lg">
              Print QR Codes — {members.length}{" "}
              {members.length === 1 ? "member" : "members"} · {pages.length}{" "}
              {pages.length === 1 ? "page" : "pages"}
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-muted/50 p-4 sm:p-6">
          <div className="flex flex-col gap-6">
            {pages.map((page, pageIndex) => (
              <div
                key={pageIndex}
                className="rounded-xl bg-white p-4 ring-1 ring-border"
              >
                <p className="pb-3 text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Page {pageIndex + 1} of {pages.length}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {page.map((member) => (
                    <MemberQrCard
                      key={member.id}
                      member={member}
                      size="compact"
                    />
                  ))}
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No members selected.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            Short bond · 12 codes per page
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
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
              disabled={members.length === 0}
            >
              <QrCode className="h-4 w-4" />
              Print {pages.length > 1 ? `${pages.length} Pages` : "QR Codes"}
            </Button>
          </div>
        </div>
      </DialogContent>

      <PrintPortal>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="print-report-page">
            <div className="grid grid-cols-3 gap-3">
              {page.map((member) => (
                <MemberQrCard key={member.id} member={member} size="print" />
              ))}
            </div>
          </div>
        ))}
      </PrintPortal>
    </Dialog>
  )
}

export { PrintSelectedQrModal }
export default PrintSelectedQrModal
