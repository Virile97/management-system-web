import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { QrCode } from "lucide-react"

const positions = ["Top Right", "Bottom Left", "Bottom Right"]
const sizes = ["Small", "Medium", "Large"]

function QRSettings({ qr, onChange }) {
  const disabled = Boolean(qr.disabled)

  return (
    <Card
      className={cn(
        "rounded-2xl p-4 sm:p-6",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <QrCode className="h-5 w-5 shrink-0 text-foreground/70" />
          <div className="min-w-0">
            <h2 className="font-heading text-xl font-normal text-foreground/80">
              QR Code on Slip
            </h2>
            {disabled && (
              <p className="text-xs text-muted-foreground">Disabled for now</p>
            )}
          </div>
        </div>
        <Switch
          checked={qr.enabled}
          disabled={disabled}
          onCheckedChange={(checked) => onChange("enabled", checked)}
        />
      </div>

      <CardContent
        className={cn(
          "flex flex-col gap-5 px-0 pt-4",
          disabled && "pointer-events-none"
        )}
      >
        <p className="text-sm text-muted-foreground">
          Each slip carries a QR code unique to the member. When scanned at the
          offering desk it auto-fills their record in the finance scanner.
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="qr-caption">QR Caption Label</Label>
          <Input
            id="qr-caption"
            value={qr.caption}
            onChange={(event) => onChange("caption", event.target.value)}
            disabled={disabled}
            className="h-10 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Position on Slip</Label>
          <div className="grid grid-cols-3 gap-2">
            {positions.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange("position", option)}
                className={cn(
                  "h-9 rounded-lg border px-1 text-xs font-medium transition-colors sm:text-sm",
                  qr.position === option
                    ? "border-transparent bg-[#1e2a4a] text-white"
                    : "border-input bg-transparent text-foreground/80 hover:bg-muted",
                  disabled && "cursor-not-allowed"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>QR Size</Label>
          <div className="flex gap-2">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange("size", option)}
                className={cn(
                  "h-9 flex-1 rounded-lg border text-sm font-medium transition-colors",
                  qr.size === option
                    ? "border-transparent bg-[#1e2a4a] text-white"
                    : "border-input bg-transparent text-foreground/80 hover:bg-muted",
                  disabled && "cursor-not-allowed"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-border">
            <QrCode className="h-7 w-7 text-foreground/80" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/85">
              Sample QR preview
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Contains{" "}
              <code className="rounded bg-border/60 px-1 py-0.5">
                MEMBER:0001
              </code>{" "}
              as a placeholder. Actual slips will embed each member&apos;s
              unique ID.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { QRSettings }
export default QRSettings
