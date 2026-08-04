import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GripVertical, Eye, EyeOff, ChevronDown, Plus } from "lucide-react"

function SlipFields({ fields, onToggleVisibility }) {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-normal text-foreground/80">Slip Fields</h2>
        <Button variant="ghost" className="h-8 gap-1.5 px-2 text-sm font-medium text-[#1e2a4a] hover:bg-[#1e2a4a]/10 hover:text-[#1e2a4a]">
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Drag to reorder · Toggle to show/hide
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 transition-opacity",
              !field.visible && "opacity-50"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              <span className="truncate text-sm font-medium text-foreground/85">{field.label}</span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {field.type} · {field.width}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
              <button
                type="button"
                onClick={() => onToggleVisibility(field.key)}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted hover:text-foreground"
              >
                {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export { SlipFields }
export default SlipFields
