import { useCallback, useEffect, useMemo, useState } from "react"
import { Activity, ArrowUpRight, BarChart3, ChartNoAxesCombined, LoaderCircle, Sparkles } from "lucide-react"
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

const currency = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value || 0)

const stockColors = ["#12b76a", "#f79009", "#e5484d"]

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
  const [search, setSearch] = useState("")
  const [advanced, setAdvanced] = useState(false)
  const [summary, setSummary] = useState(null)
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [dashboardResponse, inventoryResponse] = await Promise.all([
        api.get("/dashboard"),
        api.get("/inventory"),
      ])
      setSummary(dashboardResponse.data)
      setInventory(inventoryResponse.data)
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
    return Object.entries(grouped).map(([category, estimated_sales]) => ({ category, estimated_sales }))
  }, [visibleInventory])

  const stockHealth = useMemo(() => [
    { name: "Healthy", value: visibleInventory.filter((item) => item.status === "HEALTHY").length },
    { name: "Low stock", value: visibleInventory.filter((item) => item.status === "LOW").length },
    { name: "Overstock", value: visibleInventory.filter((item) => item.status === "OVERSTOCK").length },
  ].filter((entry) => entry.value > 0), [visibleInventory])

  const metrics = summary ? [
    { label: "Sales today", value: currency(summary.sales_today), detail: `${summary.sales_growth}% growth`, tone: "green" },
    { label: "Orders today", value: summary.orders_today, detail: "Completed orders" },
    { label: "Sales growth", value: `${summary.sales_growth}%`, detail: "Compared with the previous period", tone: "green" },
    ...(advanced ? [
      { label: "Low-stock products", value: summary.low_stock_count, detail: "Need a restock review" },
      { label: "Overstock products", value: summary.overstock_count, detail: "May benefit from a promotion" },
      { label: "AI opportunities", value: summary.ai_opportunities, detail: "Inventory recommendations" },
    ] : []),
  ] : []

  return (
    <div className="mx-auto max-w-7xl">
      <section className="dashboard-welcome mb-7 flex min-h-[216px] flex-col justify-between gap-6 rounded-2xl px-6 py-6 text-white sm:flex-row sm:items-center sm:px-8 sm:py-7">
        <div className="max-w-xl">
          <p className="welcome-eyebrow mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em]"><Sparkles size={15} /> Merchant Copilot</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[30px]">Your business, at a glance.</h1>
          <p className="welcome-copy mt-2 max-w-lg text-sm leading-6">Your Paytm for Business workspace, with a little extra intelligence to help you grow.</p>
        </div>
        <Button variant="light" className="btn-light shrink-0 self-start shadow-sm sm:self-center">
          View Insights <ArrowUpRight className="ml-2" size={16} />
        </Button>
      </section>

      <section className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Business overview</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {advanced ? "Explore detailed performance and deeper business trends." : "A simple, clear view of how your business is doing."}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-xl border border-border bg-white px-3 py-2 sm:self-auto" aria-label="Dashboard view">
            <span className={`text-sm ${advanced ? "text-text-secondary" : "font-semibold text-text-primary"}`}>Simple</span>
            <button
              type="button"
              role="switch"
              aria-label={`Dashboard mode: ${advanced ? "Advanced" : "Simple"}`}
              aria-checked={advanced}
              onClick={() => setAdvanced((value) => !value)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary/20 ${advanced ? "bg-primary" : "bg-[#b9c6d3]"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${advanced ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${advanced ? "font-semibold text-text-primary" : "text-text-secondary"}`}>Advanced</span>
          </div>
        </div>
        <div className="w-full sm:max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products or categories..." />
        </div>
      </section>

      {error && (
        <div role="alert" className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>Couldn’t load dashboard data: {error}</span>
          <Button size="sm" variant="secondary" onClick={loadDashboard}>Try again</Button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm text-text-secondary"><LoaderCircle className="animate-spin" size={18} /> Loading merchant data…</div>
      ) : summary && (
        <>
          <div className={`mb-5 grid gap-4 sm:grid-cols-2 ${advanced ? "xl:grid-cols-3" : "xl:grid-cols-3"}`}>
            {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>
          {advanced ? (
            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard title="Product sales comparison" subtitle="Units sold in the last 7 and 30 days" icon={ChartNoAxesCombined}>
                {visibleInventory.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={visibleInventory} margin={{ top: 8, right: 8, left: -18, bottom: 48 }}>
                      <CartesianGrid stroke="#e8eef4" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={58} tick={{ fill: "#62748a", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#62748a", fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="sales_7d" name="Last 7 days" fill="#00baf2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sales_30d" name="Last 30 days" fill="#123f8c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-20 text-center text-sm text-text-secondary">No matching products found.</p>}
              </ChartCard>
              <ChartCard title="Inventory health" subtitle="Current stock status across products" icon={Activity}>
                {stockHealth.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stockHealth} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="78%" paddingAngle={4}>
                        {stockHealth.map((entry, index) => <Cell key={entry.name} fill={stockColors[index === 0 ? 0 : entry.name === "Low stock" ? 1 : 2]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="py-20 text-center text-sm text-text-secondary">No matching products found.</p>}
              </ChartCard>
            </div>
          ) : (
            <ChartCard title="Sales by category" subtitle="7-day estimate using units sold × current product price" icon={BarChart3}>
              {categorySales.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySales} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                    <CartesianGrid stroke="#e8eef4" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="category" tick={{ fill: "#62748a", fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tick={{ fill: "#62748a", fontSize: 11 }} />
                    <Tooltip formatter={(value) => [currency(value), "Estimated sales"]} />
                    <Bar dataKey="estimated_sales" name="Estimated sales" fill="#00baf2" radius={[7, 7, 0, 0]} maxBarSize={64} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="py-20 text-center text-sm text-text-secondary">No matching products found.</p>}
            </ChartCard>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard
