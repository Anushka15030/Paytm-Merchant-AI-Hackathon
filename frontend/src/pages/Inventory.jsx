import { useCallback, useEffect, useMemo, useState } from "react"
import { LoaderCircle, Package } from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PageHeader from "../components/ui/PageHeader"
import SearchInput from "../components/ui/SearchInput"
import StatusBadge from "../components/ui/StatusBadge"
import api, { getApiError } from "../lib/api"
import { useLocale, useT } from "../lib/i18n"

const badgeStatus = { LOW: "low_stock", HEALTHY: "healthy", OVERSTOCK: "overstock" }

function Inventory() {
  const t = useT()
  const { locale } = useLocale()
  const money = (value) => new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0)
  const [items, setItems] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [restockId, setRestockId] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [reminderDays, setReminderDays] = useState(7)
  const [decisionSaving, setDecisionSaving] = useState(null)
  const [invoice, setInvoice] = useState(null)

  const loadInventory = useCallback(async () => {
    try {
      const [inventoryResponse, requestResponse] = await Promise.all([
        api.get("/inventory"),
        api.get("/inventory/restock-requests"),
      ])
      setError("")
      setItems(inventoryResponse.data)
      setRequests(requestResponse.data)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadInventory() }, [loadInventory])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? items.filter((item) => `${item.name} ${item.category} ${item.supplier || ""}`.toLowerCase().includes(query)) : items
  }, [items, search])

  async function createRestock(event, product) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const { data } = await api.post("/inventory/restock", {
        product_id: product.id,
        quantity: Number(quantity),
      })
      setNotice(`${t("Restock order created for {product}", { product: data.product })} (${t("Request #{id} · {status}", { id: data.id, status: t(data.status) })})`)
      const { data: updatedRequests } = await api.get("/inventory/restock-requests")
      setRequests(updatedRequests)
      setRestockId(null)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setSaving(false)
    }
  }

  async function decideRestock(request, action, doNotRemind = false) {
    setDecisionSaving(request.id)
    setError("")
    setNotice("")
    try {
      const { data } = await api.post(`/inventory/restock-requests/${request.id}/decision`, {
        action,
        remind_after_days: action === "reject" && !doNotRemind ? Number(reminderDays) : null,
        do_not_remind: doNotRemind,
      })
      setNotice(t(data.message))
      if (data.invoice_id) {
        setInvoice(data)
      }
      const { data: updatedRequests } = await api.get("/inventory/restock-requests")
      setRequests(updatedRequests)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setDecisionSaving(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("Inventory")} description={t("Live product and stock levels from your merchant account.")} action={<div className="rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-[#007eb5]">{t("{count} products", { count: items.length })}</div>} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-text-secondary"><Package size={17} className="text-primary" /> {t("Stock status and recent sales")}</div>
        <div className="w-full sm:max-w-sm"><SearchInput value={search} onChange={setSearch} placeholder={t("Search products or suppliers...")} /></div>
      </div>

      {notice && <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-[#168553]">{notice}</div>}
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{t(error)}</div>}

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-text-secondary"><LoaderCircle className="animate-spin" size={18} /> {t("Loading inventory…")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-text-muted">
                <tr>
              <th className="px-5 py-3.5 font-semibold">{t("Product")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("Category")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("Price")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("In stock")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("Sales · 7d")}</th>
              <th className="px-4 py-3.5 font-semibold">{t("Status")}</th>
              <th className="px-5 py-3.5 text-right font-semibold">{t("Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fbfdff]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-text-primary">{product.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{t("Supplier: {supplier}", { supplier: product.supplier || "—" })}</p>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">{t(product.category)}</td>
                    <td className="px-4 py-4 font-medium text-text-primary">{money(product.price)}</td>
                    <td className="px-4 py-4"><span className="font-semibold text-text-primary">{product.stock}</span><span className="text-text-muted"> / {product.max_stock}</span></td>
                    <td className="px-4 py-4 text-text-secondary">{product.sales_7d}</td>
                    <td className="px-4 py-4"><StatusBadge status={badgeStatus[product.status] || product.status} /></td>
                    <td className="px-5 py-4 text-right">
                      {restockId === product.id ? (
                        <form onSubmit={(event) => createRestock(event, product)} className="flex items-center justify-end gap-2">
                          <input aria-label={t("Restock quantity for {product}", { product: product.name })} type="number" min="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} className="h-9 w-20 rounded-lg border border-border px-2 text-sm outline-none focus:border-primary" />
                          <Button size="sm" type="submit" disabled={saving}>{saving ? t("Saving…") : t("Place order")}</Button>
                          <button type="button" onClick={() => setRestockId(null)} className="text-xs text-text-secondary hover:text-text-primary">{t("Cancel")}</button>
                        </form>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => { setRestockId(product.id); setQuantity(Math.max(product.max_stock - product.stock, 1)) }}>{t("Restock")}</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!filteredItems.length && !loading && <tr><td colSpan="7" className="px-6 py-12 text-center text-sm text-text-secondary">{t("No matching products found.")}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <section className="mt-7">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{t("Restock requests")}</h2>
            <p className="mt-1 text-sm text-text-secondary">{t("Review requests, approve an order, or set a reminder after rejecting.")}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            {t("Remind me after")}
            <select value={reminderDays} onChange={(event) => setReminderDays(event.target.value)} className="h-9 rounded-lg border border-border bg-white px-2 text-text-primary">
              {[1, 3, 7, 14, 30].map((days) => <option key={days} value={days}>{t("{days} days", { days })}</option>)}
            </select>
          </label>
        </div>
        <div className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-text-primary">{request.product}</h3>
                  <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold text-text-secondary">{t(request.status)}</span>
                  {request.reminder_due && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{t("Reminder due")}</span>}
                </div>
                <p className="mt-1 text-sm text-text-secondary">{t("Request #{id} · {quantity} units · Supplier: {supplier}", { id: request.id, quantity: request.quantity, supplier: request.supplier || "—" })}</p>
                {request.remind_at && !request.do_not_remind && <p className="mt-1 text-xs text-text-muted">{t("Reminder scheduled for {date}", { date: new Date(request.remind_at).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN") })}</p>}
                {request.reminder_sent_at && <p className="mt-1 text-xs text-[#168553]">{t("Reminder email sent {date}", { date: new Date(request.reminder_sent_at).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN") })}</p>}
                {request.invoice_id && <p className="mt-1 text-xs text-text-muted">{t("Invoice {id} · estimated total {total}", { id: request.invoice_id, total: money(request.invoice_total) })}</p>}
              </div>
              {request.status === "PENDING" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={decisionSaving === request.id} onClick={() => decideRestock(request, "approve")}>{decisionSaving === request.id ? t("Saving…") : t("Approve & invoice")}</Button>
                  <Button size="sm" variant="secondary" disabled={decisionSaving === request.id} onClick={() => decideRestock(request, "reject")}>{t("Reject & remind")}</Button>
                  <Button size="sm" variant="secondary" disabled={decisionSaving === request.id} onClick={() => decideRestock(request, "reject", true)}>{t("Do not remind")}</Button>
                </div>
              )}
            </Card>
          ))}
          {!requests.length && <Card className="text-sm text-text-secondary">{t("No restock requests yet. Use Restock in the inventory table to create one.")}</Card>}
        </div>
      </section>

      {invoice && <Card className="mt-5 border border-green-200 bg-green-50">
        <h2 className="font-semibold text-text-primary">{t("Supplier invoice generated")}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t("Invoice {id} · {product} · {quantity} units · Estimated total {total}", { id: invoice.invoice_id, product: invoice.product, quantity: invoice.quantity, total: money(invoice.invoice_total) })}</p>
        <p className="mt-1 text-xs text-text-muted">{t("Estimate uses the product’s listed price; supplier cost is not configured in this demo.")}</p>
      </Card>}
    </div>
  )
}

export default Inventory
