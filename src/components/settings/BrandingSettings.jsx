import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const accentColors = [
  { name: "navy", value: "#1e2a4a" },
  { name: "gold", value: "#c9a24b" },
  { name: "green", value: "#2f7d4f" },
  { name: "red", value: "#c0432f" },
  { name: "purple", value: "#7c5cbf" },
  { name: "gray", value: "#6b7280" },
]

function BrandingSettings({ branding, onChange }) {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-xl font-normal text-foreground/80">
          Header &amp; Branding
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-0">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="church-name">Church Name</Label>
          <Input
            id="church-name"
            value={branding.churchName}
            onChange={(event) => onChange("churchName", event.target.value)}
            className="h-10 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slip-title">Slip Title</Label>
          <Input
            id="slip-title"
            value={branding.slipTitle}
            onChange={(event) => onChange("slipTitle", event.target.value)}
            className="h-10 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="church-address">Address</Label>
          <Input
            id="church-address"
            value={branding.address}
            onChange={(event) => onChange("address", event.target.value)}
            className="h-10 rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Accent Color</Label>
          <div className="flex items-center gap-2">
            {accentColors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => onChange("accent", color.name)}
                className={cn(
                  "h-7 w-7 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all",
                  branding.accent === color.name
                    ? "ring-foreground/60"
                    : "ring-transparent"
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3">
          <Switch
            checked={branding.showLogo}
            onCheckedChange={(checked) => onChange("showLogo", checked)}
          />
          <span className="text-sm text-foreground/85">Show logo circle</span>
        </label>
      </CardContent>
    </Card>
  )
}

export { BrandingSettings }
export default BrandingSettings
