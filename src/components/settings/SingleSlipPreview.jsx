import { cn } from "@/lib/utils"
import { MiniSlip } from "@/components/settings/SlipPreview"

function SingleSlipPreview({ branding, qr, fields }) {
  return (
    <div className="rounded-2xl bg-muted p-4 sm:p-6">
      <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Single Slip Preview
      </p>

      <div className={cn("mx-auto mt-4 max-w-lg rounded-xl bg-white ring-1 ring-border")}>
        <MiniSlip size="full" branding={branding} qr={qr} fields={fields} />
      </div>
    </div>
  )
}

export { SingleSlipPreview }
export default SingleSlipPreview
