import { cn } from "@/lib/utils"
import { Plus, QrCode } from "lucide-react"

const copyLabels = [null, null, null, null]

const accentColorMap = {
  navy: "#1e2a4a",
  gold: "#c9a24b",
  green: "#2f7d4f",
  red: "#c0432f",
  purple: "#7c5cbf",
  gray: "#6b7280",
}

function isVisible(fields, key) {
  return fields.find((field) => field.key === key)?.visible ?? true
}

const qrSizeClasses = {
  Small: { compact: "h-10 w-10", full: "h-20 w-20" },
  Medium: { compact: "h-14 w-14", full: "h-28 w-28" },
  Large: { compact: "h-[4.5rem] w-[4.5rem]", full: "h-36 w-36" },
}

const qrIconSizeClasses = {
  Small: { compact: "h-7 w-7", full: "h-14 w-14" },
  Medium: { compact: "h-10 w-10", full: "h-20 w-20" },
  Large: { compact: "h-[3.25rem] w-[3.25rem]", full: "h-[6.5rem] w-[6.5rem]" },
}

function QrBlock({ qr, isFull }) {
  const boxSize = qrSizeClasses[qr.size]?.[isFull ? "full" : "compact"]
  const iconSize = qrIconSizeClasses[qr.size]?.[isFull ? "full" : "compact"]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("flex items-center justify-center rounded bg-foreground/5", boxSize)}>
        <QrCode className={cn("text-foreground/60", iconSize)} />
      </div>
      <p
        className={cn(
          "max-w-20 text-center leading-tight text-muted-foreground",
          isFull ? "text-[11px]" : "text-[9px]"
        )}
      >
        {qr.caption}
      </p>
    </div>
  )
}

function MiniSlip({ label, size = "compact", branding, qr, fields }) {
  const isFull = size === "full"
  const accentColor = accentColorMap[branding.accent] ?? accentColorMap.navy
  const showTopRightQr = qr.enabled && qr.position === "Top Right"
  const showFooterQr = qr.enabled && qr.position !== "Top Right"

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl bg-white ring-1 ring-border",
        isFull ? "gap-3 p-6" : "gap-2 p-3"
      )}
    >
      {label && (
        <span
          className={cn(
            "w-fit rounded-full bg-muted font-semibold tracking-wide text-muted-foreground uppercase",
            isFull ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
          )}
        >
          {label}
        </span>
      )}

      <div className="flex items-start justify-between">
        <div className={cn("flex items-start", isFull ? "gap-3" : "gap-2")}>
          {branding.showLogo && (
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full text-white",
                isFull ? "h-9 w-9" : "h-6 w-6"
              )}
              style={{ backgroundColor: accentColor }}
            >
              <Plus className={isFull ? "h-5 w-5" : "h-3.5 w-3.5"} />
            </div>
          )}
          <div>
            <p
              className={cn(
                "font-heading leading-tight font-semibold text-foreground/85",
                isFull ? "text-xl" : "text-sm"
              )}
            >
              {branding.churchName}
            </p>
            <p className={cn("font-medium text-foreground/70", isFull ? "text-sm" : "text-xs")}>
              {branding.slipTitle}
            </p>
            <p
              className={cn(
                "leading-tight text-muted-foreground",
                isFull ? "mt-1 text-sm" : "mt-0.5 text-[10px]"
              )}
            >
              {branding.subtitle}
            </p>
          </div>
        </div>

        {showTopRightQr && <QrBlock qr={qr} isFull={isFull} />}
      </div>

      {(isVisible(fields, "date") || isVisible(fields, "receiptNo")) && (
        <div
          className={cn(
            "grid grid-cols-2 border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            isFull ? "gap-x-6 pt-4 text-xs" : "mt-1 gap-x-3 pt-2 text-[9px]"
          )}
        >
          <span className={cn(!isVisible(fields, "date") && "invisible")}>Date</span>
          <span className={cn(!isVisible(fields, "receiptNo") && "invisible")}>Receipt No.</span>
        </div>
      )}

      {isVisible(fields, "memberName") && (
        <div
          className={cn(
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            isFull ? "pt-4 text-xs" : "pt-1.5 text-[9px]"
          )}
        >
          Member Name
        </div>
      )}

      {isVisible(fields, "offeringType") && (
        <div
          className={cn(
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            isFull ? "pt-4 text-xs" : "pt-1.5 text-[9px]"
          )}
        >
          Offering Type
          <p
            className={cn(
              "font-normal normal-case text-muted-foreground/70",
              isFull ? "mt-1 text-xs" : "mt-0.5 text-[9px]"
            )}
          >
            Tithes / Love Gift / Special Offering / Building Fund / Others
          </p>
        </div>
      )}

      {isVisible(fields, "amount") && (
        <div className={cn("border-t border-border", isFull ? "pt-4" : "pt-1.5")}>
          <span
            className={cn(
              "font-medium tracking-wide text-muted-foreground uppercase",
              isFull ? "text-xs" : "text-[9px]"
            )}
          >
            Amount (GHS)
          </span>
          <div
            className={cn(
              "rounded border border-border bg-white",
              isFull ? "mt-2 h-10" : "mt-1 h-5"
            )}
          />
        </div>
      )}

      {isVisible(fields, "amountInWords") && (
        <div
          className={cn(
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            isFull ? "pt-4 text-xs" : "pt-1.5 text-[9px]"
          )}
        >
          Amount in Words
        </div>
      )}

      {(isVisible(fields, "receivedBy") || isVisible(fields, "signature")) && (
        <div
          className={cn(
            "grid grid-cols-2 border-t border-border",
            isFull ? "gap-x-6 pt-4" : "gap-x-3 pt-1.5"
          )}
        >
          <div className={cn(!isVisible(fields, "receivedBy") && "invisible")}>
            <span
              className={cn(
                "font-medium tracking-wide text-muted-foreground uppercase",
                isFull ? "text-xs" : "text-[9px]"
              )}
            >
              Received By
            </span>
            <div className={cn("bg-border", isFull ? "mt-4 h-px" : "mt-2 h-px")} />
          </div>
          <div className={cn(!isVisible(fields, "signature") && "invisible")}>
            <span
              className={cn(
                "font-medium tracking-wide text-muted-foreground uppercase",
                isFull ? "text-xs" : "text-[9px]"
              )}
            >
              Signature
            </span>
            <div className={cn("bg-border", isFull ? "mt-4 h-px" : "mt-2 h-px")} />
          </div>
        </div>
      )}

      {showFooterQr && (
        <div
          className={cn(
            "flex border-t border-border",
            isFull ? "pt-4" : "pt-1.5",
            qr.position === "Bottom Left" ? "justify-start" : "justify-end"
          )}
        >
          <QrBlock qr={qr} isFull={isFull} />
        </div>
      )}

      <p
        className={cn(
          "border-t border-border text-center text-muted-foreground",
          isFull ? "pt-4 text-xs" : "pt-1.5 text-[9px]"
        )}
      >
        {branding.footerNote}
      </p>
    </div>
  )
}

function SlipPreview({ size = "compact", branding, qr, fields }) {
  const isFull = size === "full"

  return (
    <div className={cn("rounded-2xl bg-muted/50", isFull ? "p-4 sm:p-8" : "p-4 sm:p-6")}>
      <p
        className={cn(
          "text-center font-medium tracking-wide text-muted-foreground uppercase",
          isFull ? "text-sm" : "text-xs"
        )}
      >
        Short Bond Paper — 8.5 x 5.5 in — 4 Copies
      </p>

      <div
        className={cn(
          "grid grid-cols-1 rounded-xl bg-white ring-1 ring-border sm:grid-cols-2",
          isFull ? "mt-6 gap-4 p-4 sm:gap-6 sm:p-6" : "mt-4 gap-4 p-4"
        )}
      >
        {copyLabels.map((label, index) => (
          <MiniSlip key={index} label={label} size={size} branding={branding} qr={qr} fields={fields} />
        ))}
      </div>
    </div>
  )
}

export { SlipPreview }
export default SlipPreview
