import { cn } from "@/lib/utils"
import { Plus, QrCode } from "lucide-react"

const accentColorMap = {
  navy: "#1e2a4a",
  gold: "#c9a24b",
  green: "#2f7d4f",
  red: "#c0432f",
  purple: "#7c5cbf",
  gray: "#6b7280",
}

const qrSizeClasses = {
  Small: { compact: "h-6 w-6", print: "h-4 w-4", full: "h-10 w-10" },
  Medium: { compact: "h-6 w-6", print: "h-4 w-4", full: "h-14 w-14" },
  Large: { compact: "h-8 w-8", print: "h-5 w-5", full: "h-20 w-20" },
}

const qrIconSizeClasses = {
  Small: { compact: "h-4 w-4", print: "h-2.5 w-2.5", full: "h-7 w-7" },
  Medium: { compact: "h-4 w-4", print: "h-2.5 w-2.5", full: "h-9 w-9" },
  Large: { compact: "h-5 w-5", print: "h-3 w-3", full: "h-12 w-12" },
}

function isVisible(fields, key) {
  return fields.find((field) => field.key === key)?.visible ?? true
}

// Layout density tokens per size variant. "print" is used for both the
// single-member print flow and the bulk sheet, sized to fit a 5x2 grid
// (10 slips) on a single 8.5x5.5in sheet.
const density = {
  full: {
    cardPad: "gap-3 p-6",
    headerGap: "gap-3",
    logo: "h-9 w-9",
    logoIcon: "h-5 w-5",
    churchName: "text-xl",
    slipTitle: "text-sm",
    showSubtitle: true,
    subtitle: "mt-1 text-sm",
    sectionPad: "pt-4",
    sectionGap: "gap-x-6",
    labelText: "text-xs",
    valueText: "mt-1 text-sm",
    amountBox: "mt-2 h-10",
    showOfferingDesc: true,
    offeringDesc: "mt-1 text-xs",
    showAmountInWords: true,
    signatureLine: "mt-4 h-px",
    showFooter: true,
    footerPad: "pt-4 text-xs",
    ring: true,
  },
  compact: {
    cardPad: "gap-2 p-3",
    headerGap: "gap-2",
    logo: "h-6 w-6",
    logoIcon: "h-3.5 w-3.5",
    churchName: "text-sm",
    slipTitle: "text-xs",
    showSubtitle: false,
    sectionPad: "pt-1.5",
    sectionGap: "gap-x-3",
    labelText: "text-[9px]",
    valueText: "mt-0.5 text-xs",
    amountBox: "mt-1 h-6",
    showOfferingDesc: false,
    showAmountInWords: false,
    signatureStacked: true,
    signatureLine: "mt-1 h-px",
    showFooter: false,
    ring: true,
  },
  print: {
    cardPad: "gap-0.5 p-1.5",
    headerGap: "gap-1",
    logo: "h-3.5 w-3.5",
    logoIcon: "h-2 w-2",
    churchName: "text-[9px]",
    slipTitle: "text-[7px]",
    showSubtitle: false,
    sectionPad: "pt-0.5",
    sectionGap: "gap-x-1.5",
    labelText: "text-[5px]",
    valueText: "mt-px text-[7px]",
    amountBox: "mt-px h-2.5",
    showOfferingDesc: false,
    showAmountInWords: false,
    signatureStacked: true,
    signatureLine: "mt-px h-px",
    showFooter: false,
    ring: true,
  },
}

function MemberOfferingSlip({ member, branding, qr, fields, size = "full" }) {
  const d = density[size] ?? density.full
  const accentColor = accentColorMap[branding.accent] ?? accentColorMap.navy
  const showTopRightQr = qr.enabled && qr.position === "Top Right"
  const showFooterQr = qr.enabled && qr.position !== "Top Right"
  const boxSize = qrSizeClasses[qr.size]?.[size] ?? qrSizeClasses[qr.size]?.full
  const iconSize = qrIconSizeClasses[qr.size]?.[size] ?? qrIconSizeClasses[qr.size]?.full

  const qrBlock = (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div className={cn("flex items-center justify-center rounded bg-foreground/5", boxSize)}>
        <QrCode className={cn("text-foreground/60", iconSize)} />
      </div>
      <p className={cn("max-w-24 text-center font-mono leading-tight text-foreground/70", d.labelText)}>
        {member.id}
      </p>
      {d.showSubtitle && (
        <p className="max-w-24 text-center text-[8px] leading-tight text-muted-foreground">
          {qr.caption}
        </p>
      )}
    </div>
  )

  return (
    <div
      className={cn("flex flex-col bg-white", d.ring && "ring-1 ring-border", d.cardPad)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex min-w-0 items-start", d.headerGap)}>
          {branding.showLogo && (
            <div
              className={cn("flex shrink-0 items-center justify-center rounded-full text-white", d.logo)}
              style={{ backgroundColor: accentColor }}
            >
              <Plus className={d.logoIcon} />
            </div>
          )}
          <div className="min-w-0">
            <p className={cn("font-heading leading-tight font-semibold text-foreground/85", d.churchName)}>
              {branding.churchName}
            </p>
            <p className={cn("font-medium text-foreground/70", d.slipTitle)}>{branding.slipTitle}</p>
            {d.showSubtitle && (
              <p className={cn("text-muted-foreground", d.subtitle)}>{branding.subtitle}</p>
            )}
          </div>
        </div>

        {showTopRightQr && qrBlock}
      </div>

      {(isVisible(fields, "date") || isVisible(fields, "receiptNo")) && (
        <div
          className={cn(
            "grid grid-cols-2 border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            d.sectionGap,
            d.sectionPad,
            d.labelText
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
            d.sectionPad,
            d.labelText
          )}
        >
          Member Name
          <p className={cn("font-normal normal-case text-foreground/85", d.valueText)}>{member.name}</p>
        </div>
      )}

      {isVisible(fields, "offeringType") && (
        <div
          className={cn(
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            d.sectionPad,
            d.labelText
          )}
        >
          Offering Type
          {d.showOfferingDesc && (
            <p className={cn("font-normal normal-case text-muted-foreground/70", d.offeringDesc)}>
              Tithes / Love Gift / Special Offering / Building Fund / Others
            </p>
          )}
        </div>
      )}

      {isVisible(fields, "amount") && (
        <div className={cn("border-t border-border", d.sectionPad)}>
          <span className={cn("font-medium tracking-wide text-muted-foreground uppercase", d.labelText)}>
            Amount (GHS)
          </span>
          <div className={cn("rounded border border-border bg-white", d.amountBox)} />
        </div>
      )}

      {isVisible(fields, "amountInWords") && d.showAmountInWords && (
        <div
          className={cn(
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            d.sectionPad,
            d.labelText
          )}
        >
          Amount in Words
        </div>
      )}

      {(isVisible(fields, "receivedBy") || isVisible(fields, "signature")) && (
        <div
          className={cn(
            "border-t border-border",
            d.sectionPad,
            d.signatureStacked ? "flex flex-col gap-1" : cn("grid grid-cols-2", d.sectionGap)
          )}
        >
          <div className={cn(!isVisible(fields, "receivedBy") && "invisible")}>
            <span className={cn("font-medium tracking-wide text-muted-foreground uppercase", d.labelText)}>
              Received By
            </span>
            <div className={cn("bg-border", d.signatureLine)} />
          </div>
          <div className={cn(!isVisible(fields, "signature") && "invisible")}>
            <span className={cn("font-medium tracking-wide text-muted-foreground uppercase", d.labelText)}>
              Signature
            </span>
            <div className={cn("bg-border", d.signatureLine)} />
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
          {qrBlock}
        </div>
      )}

      {d.showFooter && (
        <p className={cn("border-t border-border text-center text-muted-foreground", d.footerPad)}>
          {branding.footerNote}
        </p>
      )}
    </div>
  )
}

export { MemberOfferingSlip }
export default MemberOfferingSlip
