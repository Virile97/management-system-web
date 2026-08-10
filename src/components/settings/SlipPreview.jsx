import Image from "next/image"
import { cn } from "@/lib/utils"
import { QrCode } from "lucide-react"

const copyLabels = Array.from({ length: 10 }, () => null)

const OFFERING_CATEGORIES = ["Tithes", "Love", "Faith", "Christbirth", "Firstfruit", "Sacrificial", "Thanksgiving"]
const OTHER_OFFERING_CATEGORIES = [
  "Bless Offering",
  "Children's Ministry",
  "Ensemble",
  "GCTV",
  "Mission",
  "Mercy",
  "Love Gift – Pastor",
]

function isVisible(fields, key) {
  return fields.find((field) => field.key === key)?.visible ?? true
}

const qrSizeClasses = {
  Small: { print: "h-4 w-4", compact: "h-10 w-10", full: "h-20 w-20" },
  Medium: { print: "h-5 w-5", compact: "h-14 w-14", full: "h-28 w-28" },
  Large: { print: "h-6 w-6", compact: "h-[4.5rem] w-[4.5rem]", full: "h-36 w-36" },
}

const qrIconSizeClasses = {
  Small: { print: "h-3 w-3", compact: "h-7 w-7", full: "h-14 w-14" },
  Medium: { print: "h-3.5 w-3.5", compact: "h-10 w-10", full: "h-20 w-20" },
  Large: { print: "h-4.5 w-4.5", compact: "h-[3.25rem] w-[3.25rem]", full: "h-[6.5rem] w-[6.5rem]" },
}

// Density tokens per size variant. "print" is calibrated so 8 copies (a
// 4x2 grid) fit within a single 8.5x5.5in sheet despite the slip having 13
// offering line items — every dimension is pushed near the practical
// minimum for legible print type.
const density = {
  full: {
    cardPad: "gap-3 p-6",
    headerGap: "gap-3",
    logo: "size-16",
    churchName: "text-xs",
    addressText: "mt-1 text-sm",
    slipTitle: "text-sm",
    sectionPad: "pt-4",
    sectionGap: "gap-x-6",
    labelText: "text-xs my-5",
    offeringLabelText: "text-[10px]",
    offeringRowGap: "gap-2",
    offeringLine: "mt-2",
    badgePad: "px-2.5 py-1 text-xs",
  },
  compact: {
    cardPad: "gap-2 p-3",
    headerGap: "gap-1",
    logo: "size-10",
    churchName: "text-[7px]",
    addressText: "mt-0.5 text-[6px]",
    slipTitle: "text-[10px]",
    sectionPad: "mt-1 pt-2",
    sectionGap: "gap-x-3",
    labelText: "text-[5px] my-2",
    offeringLabelText: "text-[5px]",
    offeringRowGap: "gap-0.5",
    offeringLine: "mt-0.5",
    badgePad: "px-2 py-0.5 text-[10px]",
  },
  print: {
    cardPad: "gap-0.5 p-3",
    headerGap: "gap-0.5",
    logo: "size-5",
    churchName: "text-[5px]",
    addressText: "text-[4.2px] leading-tight",
    slipTitle: "text-[5px]",
    sectionPad: "pt-0.5",
    sectionGap: "gap-x-1.5",
    labelText: "text-[4.5px] my-px",
    offeringLabelText: "text-[4.5px]",
    offeringRowGap: "gap-1",
    offeringLine: "mt-1px",
    badgePad: "px-1 py-px text-[5px]",
  },
}

function QrBlock({ qr, size }) {
  const boxSize = qrSizeClasses[qr.size]?.[size]
  const iconSize = qrIconSizeClasses[qr.size]?.[size]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("flex items-center justify-center rounded bg-foreground/5", boxSize)}>
        <QrCode className={cn("text-foreground/60", iconSize)} />
      </div>
    </div>
  )
}

function MiniSlip({ label, size = "compact", branding, qr, fields }) {
  const d = density[size] ?? density.compact
  const showTopRightQr = qr.enabled && qr.position === "Top Right"
  const showFooterQr = qr.enabled && qr.position !== "Top Right"

  return (
    <div className={cn("flex flex-col bg-white ring-1 ring-border", d.cardPad)}>
      {label && (
        <span
          className={cn(
            "w-fit rounded-full bg-muted font-semibold tracking-wide text-muted-foreground uppercase",
            d.badgePad
          )}
        >
          {label}
        </span>
      )}

      <div className="flex items-start justify-between">
        <div className={cn("flex w-full items-start", d.headerGap)}>
          {branding.showLogo && (
            <div className={cn("relative shrink-0", d.logo)}>
              <Image src="/images/logo-black.png" alt="" fill className="object-contain" />
            </div>
          )}
          <div>
            <p className={cn("font-heading leading-tight font-bold text-foreground/85", d.churchName)}>
              {branding.churchName}
            </p>
            <p className={cn("leading-tight text-muted-foreground", d.addressText)}>
              {branding.address}
            </p>
            <p className={cn("font-medium text-foreground/70", d.slipTitle)}>{branding.slipTitle}</p>
          </div>
        </div>

        {showTopRightQr && <QrBlock qr={qr} size={size} />}
      </div>

      {isVisible(fields, "date") && (
        <div
          className={cn(
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            d.sectionPad,
            d.labelText
          )}
        >
          Date
        </div>
      )}

      {isVisible(fields, "memberName") && (
        <div
          className={cn(
            "border-b border-dotted border-foreground/40 font-medium tracking-wide text-muted-foreground uppercase",
            d.sectionPad,
            d.labelText
          )}
        >
          Member Name
        </div>
      )}

      {(isVisible(fields, "offeringType") || isVisible(fields, "amount")) && (
        <div className={d.sectionPad}>
          <div className={cn("flex flex-col", d.offeringRowGap)}>
            {OFFERING_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center justify-between gap-3">
                <span className={cn("normal-case text-foreground/80", d.offeringLabelText)}>{category}</span>
                <div className={cn("flex-1 border-b border-dotted border-foreground/40", d.offeringLine)} />
              </div>
            ))}
          </div>

          <p className={cn("font-medium tracking-wide text-muted-foreground uppercase", d.labelText)}>
            Others
          </p>
          <div className={cn("mt-0.5 flex flex-col", d.offeringRowGap)}>
            {OTHER_OFFERING_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center justify-between gap-3">
                <span className={cn("normal-case text-foreground/80", d.offeringLabelText)}>{category}</span>
                <div className={cn("flex-1 border-b border-dotted border-foreground/40", d.offeringLine)} />
              </div>
            ))}
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 pt-0.5">
            <span className={cn("font-semibold tracking-wide text-foreground/85 uppercase", d.labelText)}>
              Total
            </span>
            <div className={cn("flex-1 border-b border-dotted border-foreground/40", d.offeringLine)} />
          </div>
        </div>
      )}

      {showFooterQr && (
        <div
          className={cn(
            "flex border-t border-border",
            d.sectionPad,
            qr.position === "Bottom Left" ? "justify-start" : "justify-end"
          )}
        >
          <QrBlock qr={qr} size={size} />
        </div>
      )}
    </div>
  )
}

function SlipPreview({ size = "compact", branding, qr, fields }) {
  const isFull = size === "full"
  const slipSize = isFull ? "compact" : "print"

  return (
    <div className={cn("bg-muted", isFull ? "p-4 sm:p-8" : "p-4 sm:p-6")}>
      <p
        className={cn(
          "text-center font-medium tracking-wide text-muted-foreground uppercase",
          isFull ? "text-sm" : "text-xs"
        )}
      >
        Short Bond Paper — 8.5 x 5.5 in — 10 Copies
      </p>

      <div
        className={cn(
          "grid grid-cols-2 rounded-xl bg-white ring-1 ring-border sm:grid-cols-5",
          isFull ? "mt-6 aspect-8.5/5.5 gap-2 p-4 sm:gap-3 sm:p-6" : "mt-4 gap-1.5 p-3"
        )}
      >
        {copyLabels.map((label, index) => (
          <MiniSlip key={index} label={label} size={slipSize} branding={branding} qr={qr} fields={fields} />
        ))}
      </div>
    </div>
  )
}

export { SlipPreview, MiniSlip }
export default SlipPreview
