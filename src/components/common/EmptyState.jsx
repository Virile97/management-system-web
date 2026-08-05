import { cn } from "@/lib/utils"

function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}

      <div className="space-y-1">
        {title && <p className="text-sm font-medium text-foreground/80">{title}</p>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export { EmptyState }
export default EmptyState
