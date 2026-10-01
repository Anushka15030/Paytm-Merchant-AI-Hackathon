import { useCallback, useEffect, useState } from "react"
import { AlertTriangle, ArrowRight, Lightbulb, LoaderCircle, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import Badge from "../components/ui/Badge"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PageHeader from "../components/ui/PageHeader"
import api, { getApiError } from "../lib/api"
import { useT } from "../lib/i18n"

function AIInsights() {
  const t = useT()
  const [data, setData] = useState({ count: 0, insights: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadInsights = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await api.get("/insights")
      setData(response.data)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInsights() }, [loadInsights])

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("AI Insights")} description={t("Recommendations based on your current stock levels and recent sales.")} action={<div className="flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-[#007eb5]"><Sparkles size={15} /> {t("{count} opportunities", { count: data.count })}</div>} />

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{t("Couldn’t load insights: {error}", { error: t(error) })}</div>}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 rounded-2xl border border-border bg-white text-sm text-text-secondary"><LoaderCircle className="animate-spin" size={18} /> {t("Reviewing your inventory…")}</div>
      ) : data.insights.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.insights.map((insight, index) => {
            const lowStock = insight.type === "LOW_STOCK"
            return (
              <Card key={`${insight.type}-${insight.product_id}-${index}`}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2.5 ${lowStock ? "bg-red-50 text-[#d92d20]" : "bg-orange-50 text-[#b54708]"}`}>
                    {lowStock ? <AlertTriangle size={19} /> : <Lightbulb size={19} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-text-primary">{insight.product}</h2>
                      <Badge variant={lowStock ? "danger" : "warning"}>{lowStock ? t("Restock soon") : t("Overstock")}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">{lowStock ? t("{product} may run out soon.", { product: insight.product }) : t("{product} has excess inventory.", { product: insight.product })}</p>
                    <div className="mt-4 rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm text-text-primary">
                      {lowStock ? (
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          {insight.days_left !== null && insight.days_left !== undefined && <span><span className="text-text-secondary">{t("Estimated stock left: {days}", { days: t("{days} days", { days: insight.days_left })})}</span></span>}
                          <span><span className="text-text-secondary">{t("Suggested restock: {quantity}", { quantity: t("{quantity} units", { quantity: insight.recommended_quantity })})}</span></span>
                        </div>
                      ) : <span>{t("Review current stock and consider a promotion to help move excess inventory.")}</span>}
                    </div>
                    <Link to="/inventory" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#007eb5] hover:text-[#005d91]">{t("Review inventory")} <ArrowRight size={15} /></Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card><div className="py-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-[#168553]"><Lightbulb size={22} /></div><h2 className="mt-4 font-semibold text-text-primary">{t("You’re in good shape")}</h2><p className="mt-1 text-sm text-text-secondary">{t("There are no inventory recommendations right now.")}</p><Button variant="secondary" className="mt-4" onClick={loadInsights}>{t("Refresh insights")}</Button></div></Card>
      )}
    </div>
  )
}

export default AIInsights
