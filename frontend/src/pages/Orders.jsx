import { useEffect, useMemo, useState } from "react"
import { FileText, LoaderCircle, ReceiptText } from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PageHeader from "../components/ui/PageHeader"
import api, { getApiError, invoiceApi } from "../lib/api"
import { useLocale, useT } from "../lib/i18n"

function Orders() {
  const t = useT()
  const { locale } = useLocale()
  const money = (value) => new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0)
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [invoice, setInvoice] = useState(null)

  useEffect(() => {
    let active = true
    api.get("/inventory")
      .then(({ data }) => {
        if (!active) return
        setProducts(data)
        if (data.length) setProductId(String(data[0].id))
      })
      .catch((requestError) => { if (active) setError(getApiError(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const selectedProduct = useMemo(() => products.find((product) => String(product.id) === productId), [products, productId])

  async function generateInvoice(event) {
    event.preventDefault()
    if (!selectedProduct) return
    setSaving(true)
    setError("")
    setInvoice(null)
    try {
      const { data } = await invoiceApi.post("/invoice", {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: Number(quantity),
        price: Number(selectedProduct.price),
        supplier: selectedProduct.supplier || "",
      })
      setInvoice(data)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("Orders")} description={t("Prepare an invoice from the products in your inventory.")} />

      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{t(error)}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-primary-light p-2.5 text-primary"><FileText size={20} /></div>
            <div><h2 className="font-semibold text-text-primary">{t("Create an invoice")}</h2><p className="mt-1 text-sm text-text-secondary">{t("Choose a product and quantity to generate an invoice.")}</p></div>
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-text-secondary"><LoaderCircle className="animate-spin" size={18} /> {t("Loading products…")}</div>
          ) : (
            <form onSubmit={generateInvoice} className="space-y-4">
              <label className="block text-sm font-medium text-text-primary">{t("Product")}
                <select required value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary">
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-text-primary">{t("Quantity")}
                <input required min="1" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary" />
              </label>
              {selectedProduct && <div className="flex items-center justify-between rounded-xl bg-[#f7f9fc] px-4 py-3 text-sm"><span className="text-text-secondary">{t("Unit price")}</span><strong className="text-text-primary">{money(selectedProduct.price)}</strong></div>}
              <Button type="submit" disabled={saving || !selectedProduct} className="w-full">{saving ? t("Generating…") : t("Generate invoice")}</Button>
            </form>
          )}
        </Card>

        <Card className="h-fit">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#eef8ff] p-2.5 text-[#007eb5]"><ReceiptText size={20} /></div>
            <div><h2 className="font-semibold text-text-primary">{t("Invoice preview")}</h2><p className="mt-1 text-sm text-text-secondary">{t("Your generated invoice details will appear here.")}</p></div>
          </div>
          {invoice ? (
            <div className="mt-5 rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between border-b border-border pb-3"><span className="text-sm text-text-secondary">{t("Invoice ID")}</span><strong className="text-sm text-text-primary">{invoice.invoice_id}</strong></div>
              <div className="space-y-3 py-4 text-sm">
                <div className="flex justify-between gap-4"><span className="text-text-secondary">{t("Product")}</span><strong className="text-right text-text-primary">{invoice.product}</strong></div>
                <div className="flex justify-between"><span className="text-text-secondary">{t("Quantity")}</span><strong className="text-text-primary">{invoice.quantity}</strong></div>
                <div className="flex justify-between"><span className="text-text-secondary">{t("Supplier")}</span><strong className="text-text-primary">{invoice.supplier || "—"}</strong></div>
              </div>
              <div className="flex justify-between border-t border-border pt-3"><span className="font-semibold text-text-primary">{t("Total")}</span><strong className="text-lg text-[#007eb5]">{money(invoice.total)}</strong></div>
            </div>
          ) : <div className="mt-5 rounded-xl border border-dashed border-border bg-[#fbfcfe] px-4 py-10 text-center text-sm text-text-secondary">{t("Complete the form to create an invoice preview.")}</div>}
        </Card>
      </div>
    </div>
  )
}

export default Orders
