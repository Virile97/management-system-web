import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GripVertical, Eye, EyeOff, ChevronDown, Plus } from "lucide-react"

function SlipFields({ fields, onToggleVisibility }) {
  return (
    <Card className="rounded-2xl p-3 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-normal text-foreground/80 sm:text-xl">
          Slip Fields
        </h2>
        <Button
          variant="ghost"
          className="h-8 gap-1.5 px-2 text-sm font-medium text-[#1e2a4a] hover:bg-[#1e2a4a]/10 hover:text-[#1e2a4a]"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
        Drag to reorder · Toggle to show/hide
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:mt-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-2.5 transition-opacity sm:px-3",
              (!field.visible || field.disabled) && "opacity-50",
              field.disabled && "cursor-not-allowed"
            )}
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground/85">
                  {field.label}
                </p>
                <p className="truncate text-[11px] text-muted-foreground sm:hidden">
                  {field.disabled
                    ? "Disabled for now"
                    : `${field.type} · ${field.width}`}
                </p>
              </div>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {field.disabled
                  ? "Disabled for now"
                  : `${field.type} · ${field.width}`}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-muted-foreground sm:gap-2">
              <button
                type="button"
                onClick={() => onToggleVisibility(field.key)}
                disabled={field.disabled}
                aria-label={
                  field.disabled
                    ? `${field.label} is disabled`
                    : field.visible
                      ? `Hide ${field.label}`
                      : `Show ${field.label}`
                }
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 sm:h-6 sm:w-6 sm:rounded"
              >
                {field.visible ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              <ChevronDown className="hidden h-4 w-4 sm:block" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export { SlipFields }
export default SlipFields
