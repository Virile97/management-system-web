"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BrandingSettings } from "@/components/settings/BrandingSettings"
import { QRSettings } from "@/components/settings/QRSettings"
import { SlipFields } from "@/components/settings/SlipFields"
import { SlipPreview } from "@/components/settings/SlipPreview"
import { useSlipConfig } from "@/components/settings/SlipConfigContext"
import { RotateCcw, Eye, EyeOff, Printer } from "lucide-react"

export default function SettingsPage() {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const { branding, qr, fields, updateBranding, updateQr, toggleFieldVisibility, reset } =
    useSlipConfig()

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Offering Slip
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure the 4-copy slip printed on short bond paper (8.5 x 5.5 in)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="h-10 gap-2 rounded-lg px-4" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              className="h-10 gap-2 rounded-lg px-4"
              onClick={() => setIsPreviewing((previewing) => !previewing)}
            >
              {isPreviewing ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {isPreviewing ? "Edit" : "Preview"}
            </Button>
            <Button className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90">
              <Printer className="h-4 w-4" />
              Print Slip
            </Button>
          </div>
        </div>

        {isPreviewing ? (
          <div className="mt-6">
            <SlipPreview size="full" branding={branding} qr={qr} fields={fields} />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <BrandingSettings branding={branding} onChange={updateBranding} />
              <QRSettings qr={qr} onChange={updateQr} />
              <SlipFields fields={fields} onToggleVisibility={toggleFieldVisibility} />
            </div>

            <div className="lg:sticky lg:top-8 lg:self-start">
              <SlipPreview branding={branding} qr={qr} fields={fields} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
