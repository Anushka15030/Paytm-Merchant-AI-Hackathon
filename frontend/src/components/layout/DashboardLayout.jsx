import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import api from "../../lib/api"
import { useT } from "../../lib/i18n"

function DashboardLayout({ children }) {
  const t = useT()
  const [merchant, setMerchant] = useState(null)

  useEffect(() => {
    let active = true
    api.get("/dashboard")
      .then(({ data }) => { if (active) setMerchant(data.merchant) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return (
    <div className="app-shell flex min-h-screen bg-background">
      <Sidebar merchant={merchant} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar merchant={merchant} />
        <div className="mobile-nav overflow-x-auto border-b border-border bg-white lg:hidden"><Sidebar mobile merchant={merchant} /></div>
        <main className="workspace-main flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <footer className="workspace-footer flex items-center justify-between border-t border-border bg-white px-4 py-4 text-xs sm:px-7">
          <span className="text-text-secondary">{t("© 2026 Merchant Copilot")}</span>
          <span className="font-medium text-[#002970]">{t("Paytm for Business")}</span>
        </footer>
      </div>
    </div>
  )
}

export default DashboardLayout
