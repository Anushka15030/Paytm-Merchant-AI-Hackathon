import { Bell, ChevronDown, Globe2, HelpCircle } from "lucide-react"
import IconButton from "../ui/IconButton"
import PaytmBusinessLogo from "./PaytmBusinessLogo"

function Navbar({ merchant }) {
  return (
    <header className="topbar sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-white px-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <div className="lg:hidden"><PaytmBusinessLogo compact /></div>
        <div className="hidden h-8 w-px bg-border lg:block" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">{merchant?.name || "Shree Ganesh General Store"}</p>
          <p className="text-xs text-text-secondary">{merchant?.location || "Pune, Maharashtra"} <span className="px-1 text-[#bac5d1]">•</span> Merchant dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button type="button" className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition hover:bg-[#f5f9fc] hover:text-primary sm:flex">
          <Globe2 size={16} /><span>English / हिंदी</span><ChevronDown size={14} />
        </button>
        <IconButton label="Help"><HelpCircle size={18} /></IconButton>
        <div className="relative">
          <IconButton label="Notifications"><Bell size={18} /></IconButton>
          <span className="pointer-events-none absolute right-[7px] top-[6px] h-2 w-2 rounded-full border-2 border-white bg-[#ff6b55]" />
        </div>
        <button type="button" className="ml-1 flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-[#f5f9fc]">
          <div className="merchant-avatar flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">A</div>
          <span className="hidden text-sm font-medium text-text-primary sm:block">Anushka</span>
          <ChevronDown size={14} className="hidden text-text-muted sm:block" />
        </button>
      </div>
    </header>
  )
}

export default Navbar
