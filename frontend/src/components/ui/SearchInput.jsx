import { Search, X } from "lucide-react"
import IconButton from "./IconButton"
import { useT } from "../../lib/i18n"

function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}) {
  const t = useT()
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t(placeholder)}
        className="
          h-10 w-full rounded-input
          border border-border
          bg-surface
          pl-10 pr-10
          text-sm text-text-primary
          placeholder:text-text-muted
          outline-none
          transition
          focus:border-primary
          focus:ring-4 focus:ring-primary/10
        "
      />

      {value && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2">
          <IconButton
            label={t("Clear search")}
            size="sm"
            onClick={() => onChange("")}
          >
            <X size={16} />
          </IconButton>
        </div>
      )}
    </div>
  )
}

export default SearchInput
