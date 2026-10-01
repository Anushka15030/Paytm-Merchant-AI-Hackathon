import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Activity, ArrowUpRight, BarChart3, ChartNoAxesCombined, LoaderCircle, Sparkles, AudioLines, Volume2, Pause, FileText, ChevronDown, CheckCircle2 } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import SearchInput from "../components/ui/SearchInput"
import api, { getApiError } from "../lib/api"
import { useT, useLocale } from "../lib/i18n"

const stockColors = ["#12b76a", "#f79009", "#e5484d"]
const briefLanguages = ["Hinglish", "हिंदी", "English"]

function BusinessBrief({ metrics, inventory, insights }) {
  const [language, setLanguage] = useState("Hinglish")
  const [scriptOpen, setScriptOpen] = useState(false)
  const [audioState, setAudioState] = useState("idle")
  const timerRef = useRef(null)
  const lowStockProducts = inventory.filter((product) => Number(product.stock) <= Number(product.min_stock))
  const lowStockInsights = (insights?.insights || []).filter((item) => item.type === "LOW_STOCK" && lowStockProducts.some((product) => product.id === item.product_id))
  const priorityAction = lowStockInsights.find((item) => item.recommended_action)?.recommended_action
  const priorityText = lowStockProducts.length ? `${priorityAction || "Restock review"}: ${lowStockProducts.map((product) => product.name).join(", ")}` : ""
  const reportMetrics = metrics.map((metric) => `${metric.label}: ${metric.value}. ${metric.detail}.`)
  const reportText = [
    language === "हिंदी" ? "आज का बिज़नेस ब्रीफ़।" : language === "English" ? "Today’s business brief." : "Aaj ka business brief.",
    ...reportMetrics,
    priorityText && `${language === "हिंदी" ? "अगली प्राथमिकता" : language === "English" ? "Tomorrow’s priority" : "Kal ki priority"}: ${priorityText}.`,
  ].filter(Boolean).join(" ")
  useEffect(() => () => {
    window.speechSynthesis?.cancel()
    window.clearTimeout(timerRef.current)
  }, [])
  const playReport = () => {
    if (audioState === "playing" || audioState === "loading") {
      window.speechSynthesis?.cancel()
      window.clearTimeout(timerRef.current)
      setAudioState("idle")
      return
    }
    setAudioState("loading")
    timerRef.current = window.setTimeout(() => {
      if (!window.speechSynthesis) { setAudioState("idle"); return }
      const utterance = new SpeechSynthesisUtterance(reportText)
      utterance.lang = language === "हिंदी" ? "hi-IN" : language === "English" ? "en-IN" : "hi-IN"
      utterance.onstart = () => setAudioState("playing")
      utterance.onend = () => setAudioState("idle")
      utterance.onerror = () => setAudioState("idle")
      window.speechSynthesis.speak(utterance)
    }, 180)
  }
  return (
    <section className="business-brief mb-6" aria-labelledby="business-brief-title">
      <header className="brief-header">
        <div className="brief-title-group">
          <div className="brief-mark"><Sparkles size={21} /></div>
          <div>
            <div className="brief-heading-line"><h2 id="business-brief-title">Today’s Business Brief</h2><span className="brief-report-label">End of Day Report</span></div>
            <p>Business insights and spoken summary from your dashboard data</p>
          </div>
        </div>
        <div className="brief-status"><AudioLines size={17} /><span className="brief-status-dot" />Audio Ready</div>
      </header>
      <div className="brief-metrics">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>
      {priorityText && <div className="brief-priority"><div className="brief-priority-icon"><CheckCircle2 size={20} /></div><p><strong>Tomorrow’s Priority:</strong><span>{priorityText}</span></p></div>}
      <div className="brief-controls">
        <button type="button" className="brief-play" onClick={playReport} aria-live="polite">
          {audioState === "loading" ? <LoaderCircle size={19} className="brief-spin" /> : audioState === "playing" ? <Pause size={19} /> : <Volume2 size={19} />}
          {audioState === "loading" ? "Preparing report…" : audioState === "playing" ? "Pause Voice Report" : "Play Voice Report"}
        </button>
        <div className="brief-control-right">
          <div className="brief-languages" role="group" aria-label="Voice report language">
            {briefLanguages.map((choice) => <button key={choice} type="button" aria-pressed={language === choice} className={language === choice ? "selected" : ""} onClick={() => { if (audioState !== "idle") { window.speechSynthesis?.cancel(); window.clearTimeout(timerRef.current); setAudioState("idle") }; setLanguage(choice) }}>{choice}</button>)}
          </div>
          <button type="button" className={`brief-script-toggle ${scriptOpen ? "open" : ""}`} aria-expanded={scriptOpen} onClick={() => setScriptOpen((open) => !open)}><FileText size={18} /> Script <ChevronDown size={16} /></button>
        </div>
      </div>
      {scriptOpen && <div className="brief-script"><p className="brief-script-label">Voice report · {language}</p><p>{reportText || "No sales, order, or insight data is available for the report."}</p></div>}
    </section>
  )
}

function MetricCard({ label, value, detail, tone = "blue" }) {
  return (
    <Card padding="md">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
      <p className={`mt-1 text-xs ${tone === "green" ? "text-[#168553]" : "text-text-muted"}`}>{detail}</p>
    </Card>
  )
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="mt-0.5 rounded-lg bg-primary-light p-2 text-primary"><Icon size={17} /></div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
        </div>
      </div>
      <div className="h-[290px] px-3 py-4 sm:px-5">{children}</div>
    </Card>
  )
}

function Dashboard() {
  const t = useT()
  const { locale } = useLocale()
  const [search, setSearch] = useState("")
  const [advanced, setAdvanced] = useState(false)
  const [summary, setSummary] = useState(null)
  const [inventory, setInventory] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [dashboardResponse, inventoryResponse, insightsResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/inventory"),
        api.get("/insights").catch(() => ({ data: { insights: [] } })),
      ])
      setSummary(dashboardResponse.data)
      setInventory(inventoryResponse.data)
      setInsights(insightsResponse.data)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const visibleInventory = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return inventory
    return inventory.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query))
  }, [inventory, search])

  const categorySales = useMemo(() => {
    const grouped = visibleInventory.reduce((result, product) => {
      const category = product.category || "Other"
      result[category] = (result[category] || 0) + (Number(product.sales_7d) || 0) * (Number(product.price) || 0)
      return result
    }, {})
    return Object.entries(grouped).map(([category, estimated_sales]) => ({ category: t(category), estimated_sales }))
  }, [visibleInventory, t])

  const stockHealth = useMemo(() => [
    { name: "Healthy", label: t("Healthy"), color: stockColors[0], value: visibleInventory.filter((item) => item.status === "HEALTHY").length },
    { name: "Low stock", label: t("Low stock"), color: stockColors[1], value: visibleInventory.filter((item) => item.status === "LOW").length },
    { name: "Overstock", label: t("Overstock"), color: stockColors[2], value: visibleInventory.filter((item) => item.status === "OVERSTOCK").length },
  ].filter((entry) => entry.value > 0), [visibleInventory, t])

  const metrics = summary ? [
    { label: t("Sales today"), value: new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(summary.sales_today || 0), detail: `${summary.sales_growth}% ${t("growth")}`, tone: "green" },
    { label: t("Orders today"), value: summary.orders_today, detail: t("Completed orders") },
    { label: t("Sales growth"), value: `${summary.sales_growth}%`, detail: t("Compared with the previous period"), tone: "green" },
    ...(advanced ? [
      { label: t("Low-stock products"), value: summary.low_stock_count, detail: t("Need a restock review") },
      { label: t("Overstock products"), value: summary.overstock_count, detail: t("May benefit from a promotion") },
      { label: t("AI opportunities"), value: summary.ai_opportunities, detail: t("Inventory recommendations") },
    ] : []),
  ] : []

  return (
    <div className="mx-auto max-w-7xl">
      <section className="dashboard-welcome mb-7 flex min-h-[216px] flex-col justify-between gap-6 rounded-2xl px-6 py-6 text-white sm:flex-row sm:items-center sm:px-8 sm:py-7">
        <div className="max-w-xl">
          <p className="welcome-eyebrow mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em]"><Sparkles size={15} /> {t("Merchant Copilot")}</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">{t("Your business, at a glance.")}</h1>
          <p className="welcome-copy mt-2 max-w-lg text-sm leading-6">{t("Your Paytm for Business workspace, with a little extra intelligence to help you grow.")}</p>
        </div>
        <Button variant="light" className="btn-light shrink-0 self-start shadow-sm sm:self-center">
          {t("View Insights")} <ArrowUpRight className="ml-2" size={16} />
        </Button>
      </section>

      <section className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t("Business overview")}</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {advanced ? t("Explore detailed performance and deeper business trends.") : t("A simple, clear view of how your business is doing.")}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-xl border border-border bg-white px-3 py-2 sm:self-auto" aria-label={t("Dashboard view")}>
            <span className={`text-sm ${advanced ? "text-text-secondary" : "font-semibold text-text-primary"}`}>{t("Simple")}</span>
            <button
              type="button"
              role="switch"
              aria-label={t("Dashboard mode: {mode}", { mode: advanced ? t("Advanced") : t("Simple") })}
              aria-checked={advanced}
              onClick={() => setAdvanced((value) => !value)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary/20 ${advanced ? "bg-primary" : "bg-[#b9c6d3]"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${advanced ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${advanced ? "font-semibold text-text-primary" : "text-text-secondary"}`}>{t("Advanced")}</span>
          </div>
        </div>
        <div className="w-full sm:max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder={t("Search products or categories...")} />
        </div>
      </section>

      {error && (
        <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{t("Couldn’t load dashboard data: {error}", { error: t(error) })}</span>
          <Button size="sm" variant="secondary" onClick={loadDashboard}>{t("Try again")}</Button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm text-text-secondary"><LoaderCircle className="animate-spin" size={18} /> {t("Loading merchant data…")}</div>
      ) : summary && (
        <>
          {!advanced && <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>}
          {advanced ? (
            <>
            <BusinessBrief metrics={metrics} inventory={inventory} insights={insights} />
            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard title={t("Product sales comparison")} subtitle={t("Units sold in the last 7 and 30 days")} icon={ChartNoAxesCombined}>
                {visibleInventory.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visibleInventory} margin={{ top: 8, right: 8, left: -18, bottom: 48 }}>
                      <CartesianGrid stroke="#e8eef4" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={58} tick={{ fill: "#62748a", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#62748a", fontSize: 11 }} />
                      <Tooltip formatter={(value, name) => [value, t(name)]} />
                      <Legend formatter={(value) => t(value)} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="sales_7d" name={t("Last 7 days")} fill="#00baf2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sales_30d" name={t("Last 30 days")} fill="#123f8c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-20 text-center text-sm text-text-secondary">{t("No matching products found.")}</p>}
              </ChartCard>
              <ChartCard title={t("Inventory health")} subtitle={t("Current stock status across products")} icon={Activity}>
                {stockHealth.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockHealth} dataKey="value" nameKey="label" innerRadius="52%" outerRadius="78%" paddingAngle={4}>
                        {stockHealth.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, t(name)]} />
                      <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="py-20 text-center text-sm text-text-secondary">{t("No matching products found.")}</p>}
              </ChartCard>
            </div>
            </>
          ) : (
            <ChartCard title={t("Sales by category")} subtitle={t("7-day estimate using units sold × current product price")} icon={BarChart3}>
              {categorySales.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                    <CartesianGrid stroke="#e8eef4" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="category" tick={{ fill: "#62748a", fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { notation: "compact", maximumFractionDigits: 0 }).format(value)} tick={{ fill: "#62748a", fontSize: 11 }} />
                    <Tooltip formatter={(value) => [new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value), t("Estimated sales")]} />
                    <Bar dataKey="estimated_sales" name={t("Estimated sales")} fill="#00baf2" radius={[7, 7, 0, 0]} maxBarSize={64} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="py-20 text-center text-sm text-text-secondary">{t("No matching products found.")}</p>}
            </ChartCard>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
