import { PackageOpen } from "lucide-react"

function EmptyState({
  title = "Nothing here yet",
  description = "There is no information to display.",
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
        <PackageOpen size={22} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-text-secondary">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState