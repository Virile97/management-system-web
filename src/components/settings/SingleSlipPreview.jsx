import { cn } from "@/lib/utils"
import { MiniSlip } from "@/components/settings/SlipPreview"

function SingleSlipPreview({ branding, qr, fields }) {
  return (
    <div className="rounded-2xl bg-muted p-3 sm:p-6">
      <p className="text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
        Single Slip Preview
      </p>

      <div
        className={cn(
          "mx-auto mt-3 max-w-lg overflow-hidden rounded-xl bg-white ring-1 ring-border sm:mt-4"
        )}
      >
        <MiniSlip size="full" branding={branding} qr={qr} fields={fields} />
      </div>
    </div>
  )
}

export { SingleSlipPreview }
export default SingleSlipPreview
