"use client"

import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

const sizeStyles = {
  full: {
    card: "gap-3 p-5",
    qr: 180,
    name: "text-base",
  },
  compact: {
    card: "gap-2 p-3",
    qr: 96,
    name: "text-xs",
  },
  print: {
    card: "gap-1 p-1.5",
    qr: 92,
    name: "text-[9px]",
  },
}

/**
 * Member QR label: scannable code with the member name under it. The QR value
 * is the member id so finance scan flows can resolve the person.
 */
function MemberQrCard({ member, size = "full", className }) {
  const styles = sizeStyles[size] ?? sizeStyles.full
  const value = String(member.id)

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-white text-center ring-1 ring-border",
        styles.card,
        className
      )}
    >
      <div className="rounded-md bg-white p-1">
        <QRCodeSVG
          value={value}
          size={styles.qr}
          level="M"
          marginSize={1}
          bgColor="#ffffff"
          fgColor="#1e2a4a"
        />
      </div>

      <p
        className={cn(
          "w-full truncate font-medium text-[#1e2a4a]",
          styles.name
        )}
      >
        {member.name}
      </p>
    </div>
  )
}

export { MemberQrCard }
export default MemberQrCard
