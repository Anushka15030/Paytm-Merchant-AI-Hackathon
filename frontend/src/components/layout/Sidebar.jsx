import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Megaphone,
  Bell,
  //Settings,
  Store,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import PaytmBusinessLogo from "./PaytmBusinessLogo"
import { useT } from "../../lib/i18n"

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Orders", path: "/orders", icon: ShoppingBag },
  { label: "AI Insights", path: "/ai-insights", icon: Sparkles },
  { label: "Campaigns", path: "/campaigns", icon: Megaphone },
  { label: "Notifications", path: "/notifications", icon: Bell },
  //{ label: "Settings", path: "/settings", icon: Settings },
]

function Sidebar({ mobile = false, merchant }) {
  const t = useT()
  const merchantName = merchant?.name || "Shree Ganesh General Store"
  const merchantLocation = merchant?.location || "Pune, Maharashtra"
  return (
    <aside className={`${mobile ? "mobile-nav flex lg:hidden" : "app-sidebar hidden lg:flex lg:flex-col"} w-64 shrink-0`}>
      {!mobile && (
        <>
          <div className="flex h-[76px] items-center gap-3 border-b border-border px-5">
            <PaytmBusinessLogo />
          </div>
          <div className="mx-4 mt-5 flex items-center gap-3 rounded-xl bg-[#f5f9fc] px-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary shadow-sm"><Store size={18} /></div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-text-primary">{t("Merchant Copilot")}</p>
              <p className="text-[11px] text-text-secondary">{t("AI Business Partner")}</p>
            </div>
          </div>
          <p className="nav-section-label px-6 pb-2 pt-7">{t("Workspace")}</p>
        </>
      )}
      <nav className={`${mobile ? "flex min-w-max gap-1 px-3 py-2" : "flex-1 space-y-1 px-3 pb-4"}`} aria-label={mobile ? t("Mobile navigation") : t("Main navigation")}>
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${mobile ? "whitespace-nowrap" : ""} ${isActive ? "nav-link-active" : "text-text-secondary hover:bg-[#f5f9fc] hover:text-[#007eb5]"}`}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{t(item.label)}</span>
            </NavLink>
          )
        })}
      </nav>
      {!mobile && (
        <div className="mx-4 mb-4 rounded-xl border border-[#e7edf3] bg-white p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-text-muted">{t("Your store")}</p>
          <p className="mt-2 truncate text-sm font-semibold text-text-primary">{merchantName}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{merchantLocation}</p>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
