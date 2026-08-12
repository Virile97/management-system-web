import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

/**
 * Renders a trail of crumbs from `items`, each of which is either a link
 * (`href`), a button (`onClick`), or plain text. `active` marks the crumb the
 * page is currently on, and `icon` is an optional lucide component rendered
 * before the label.
 */
function Breadcrumb({ items, className }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 overflow-x-auto", className)}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const content = (
          <>
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {item.label}
          </>
        )

        const interactiveClass = item.active
          ? "font-medium text-amber-600 hover:text-amber-700"
          : "text-muted-foreground hover:text-foreground"

        return (
          <div key={item.label} className="flex shrink-0 items-center gap-1.5">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
            )}

            {item.href ? (
              <Link
                href={item.href}
                className={cn("flex items-center gap-1.5", interactiveClass)}
              >
                {content}
              </Link>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className={cn("flex items-center gap-1.5", interactiveClass)}
              >
                {content}
              </button>
            ) : (
              <span
                className={cn(
                  "flex items-center gap-1.5",
                  item.active
                    ? "font-medium text-amber-600"
                    : "text-muted-foreground/70"
                )}
              >
                {content}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export { Breadcrumb }
export default Breadcrumb
