import Image from "next/image"
import { cn } from "@/lib/utils"
import { QrCode } from "lucide-react"
import {
  OFFERING_CATEGORIES,
  OTHER_OFFERING_CATEGORIES,
} from "@/utils/constants"

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
    churchName: "text-xl",
    slipTitle: "text-sm",
    showSubtitle: true,
    subtitle: "mt-1 text-sm",
    sectionPad: "pt-4",
    sectionGap: "gap-x-6",
    labelText: "text-xs",
    valueText: "mt-1 text-sm",
    offeringLabelText: "text-sm",
    offeringRowGap: "gap-1.5",
    offeringLine: "mb-1",
    ring: true,
  },
  compact: {
    cardPad: "gap-2 p-3",
    headerGap: "gap-2",
    logo: "h-6 w-6",
    churchName: "text-sm",
    slipTitle: "text-xs",
    showSubtitle: false,
    sectionPad: "pt-1.5",
    sectionGap: "gap-x-3",
    labelText: "text-[9px]",
    valueText: "mt-0.5 text-xs",
    offeringLabelText: "text-[9px]",
    offeringRowGap: "gap-0.5",
    offeringLine: "mb-0.5",
    ring: true,
  },
  print: {
    cardPad: "gap-0.5 p-1.5",
    headerGap: "gap-1",
    logo: "h-3.5 w-3.5",
    churchName: "text-[9px]",
    slipTitle: "text-[7px]",
    showSubtitle: false,
    sectionPad: "pt-0.5",
    sectionGap: "gap-x-1.5",
    labelText: "text-[5px]",
    valueText: "mt-px text-[7px]",
    offeringLabelText: "text-[5px]",
    offeringRowGap: "gap-px",
    offeringLine: "mb-px",
    ring: true,
  },
}

function MemberOfferingSlip({ member, branding, qr, fields, size = "full" }) {
  const d = density[size] ?? density.full
  const showTopRightQr = qr.enabled && qr.position === "Top Right"
  const showFooterQr = qr.enabled && qr.position !== "Top Right"
  const boxSize = qrSizeClasses[qr.size]?.[size] ?? qrSizeClasses[qr.size]?.full
  const iconSize =
    qrIconSizeClasses[qr.size]?.[size] ?? qrIconSizeClasses[qr.size]?.full

  const qrBlock = (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className={cn(
          "flex items-center justify-center rounded bg-foreground/5",
          boxSize
        )}
      >
        <QrCode className={cn("text-foreground/60", iconSize)} />
      </div>
      <p
        className={cn(
          "max-w-24 text-center font-mono leading-tight text-foreground/70",
          d.labelText
        )}
      >
        {member.id}
      </p>
    </div>
  )

  return (
    <div
      className={cn(
        "flex flex-col bg-white",
        d.ring && "ring-1 ring-border",
        d.cardPad
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex min-w-0 items-start", d.headerGap)}>
          {branding.showLogo && (
            <div className={cn("relative shrink-0", d.logo)}>
              <Image
                src="/images/logo.png"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="min-w-0">
            <p
              className={cn(
                "font-heading leading-tight font-semibold text-foreground/85",
                d.churchName
              )}
            >
              {branding.churchName}
            </p>
            {d.showSubtitle && (
              <p className={cn("text-muted-foreground", d.subtitle)}>
                {branding.address}
              </p>
            )}
            <p className={cn("font-medium text-foreground/70", d.slipTitle)}>
              {branding.slipTitle}
            </p>
          </div>
        </div>

        {showTopRightQr && qrBlock}
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
            "border-t border-border font-medium tracking-wide text-muted-foreground uppercase",
            d.sectionPad,
            d.labelText
          )}
        >
          Member Name
          <p
            className={cn(
              "font-normal normal-case text-foreground/85",
              d.valueText
            )}
          >
            {member.name}
          </p>
        </div>
      )}

      {(isVisible(fields, "offeringType") || isVisible(fields, "amount")) && (
        <div className={cn("border-t border-border", d.sectionPad)}>
          <div className={cn("flex flex-col", d.offeringRowGap)}>
            {OFFERING_CATEGORIES.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between gap-3"
              >
                <span
                  className={cn(
                    "normal-case text-foreground/80",
                    d.offeringLabelText
                  )}
                >
                  {category}
                </span>
                <div
                  className={cn(
                    "flex-1 border-b border-dotted border-foreground/40",
                    d.offeringLine
                  )}
                />
              </div>
            ))}
          </div>

          <p
            className={cn(
              "mt-2 font-medium tracking-wide text-muted-foreground uppercase",
              d.labelText
            )}
          >
            Others
          </p>
          <div className={cn("mt-1 flex flex-col", d.offeringRowGap)}>
            {OTHER_OFFERING_CATEGORIES.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between gap-3"
              >
                <span
                  className={cn(
                    "normal-case text-foreground/80",
                    d.offeringLabelText
                  )}
                >
                  {category}
                </span>
                <div
                  className={cn(
                    "flex-1 border-b border-dotted border-foreground/40",
                    d.offeringLine
                  )}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-1.5">
            <span
              className={cn(
                "font-semibold tracking-wide text-foreground/85 uppercase",
                d.labelText
              )}
            >
              Total
            </span>
            <div
              className={cn(
                "flex-1 border-b border-dotted border-foreground/40",
                d.offeringLine
              )}
            />
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
    </div>
  )
}

export { MemberOfferingSlip }
export default MemberOfferingSlip
