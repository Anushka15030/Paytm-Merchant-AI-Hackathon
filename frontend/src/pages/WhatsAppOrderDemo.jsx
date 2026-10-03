import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCheck, MessageCircle, Send, Sparkles, Store, X } from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PageHeader from "../components/ui/PageHeader"
import api, { getApiError } from "../lib/api"
import { useLocale, useT } from "../lib/i18n"

function WhatsAppOrderDemo() {
  const t = useT()
  const { locale } = useLocale()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get("order")
  const [message, setMessage] = useState("")
  const [thread, setThread] = useState([])
  const [order, setOrder] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [invoice, setInvoice] = useState(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const money = (value) => new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0)

  useEffect(() => {
    if (!orderCode) return
    let active = true
    api.get(`/orders/${orderCode}`).then(({ data }) => {
      if (!active) return
      setOrder(data)
      const messages = [
        { role: "customer", type: "text", text: data.customerMessage || t("bhai 1 amul doodh bhej dena") },
        { role: "bot", type: "summary", summary: { text: `${data.quantity} × ${data.product}; ${data.stockAfter} in stock; total ${money(data.amount)}.` } },
        { role: "bot", type: "payment", order: data },
      ]
      if (data.paymentStatus === "SUCCESS") {
        messages.push({ role: "customer", type: "text", text: t("Payment successful") })
        messages.push({ role: "bot", type: "confirmation", order: data })
      }
      setThread(messages)
      setError("")
    }).catch((requestError) => { if (active) setError(getApiError(requestError)) })
    return () => { active = false }
  }, [orderCode, t])

  async function sendMessage(event) {
    event.preventDefault()
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setError("")
    setInvoice(null)
    setThread((current) => [...current, { role: "customer", type: "text", text }])
    setMessage("")
    try {
      const { data } = await api.post("/whatsapp/message", { message: text, customerId: "demo-customer", customer_name: "Demo Customer" })
      if (data.success) {
        setOrder(data)
        setThread((current) => [...current, { role: "bot", type: "summary", summary: data.aiSummary }, { role: "bot", type: "text", text: data.reply }, { role: "bot", type: "payment", order: data }])
      } else {
        setThread((current) => [...current, { role: "bot", type: "summary", summary: data.aiSummary }, { role: "bot", type: "text", text: data.reply }])
      }
    } catch (requestError) {
      const errorText = getApiError(requestError)
      setThread((current) => [...current, { role: "bot", type: "text", text: errorText }])
    } finally {
      setSending(false)
    }
  }

  async function showInvoice(code) {
    setInvoiceLoading(true)
    try {
      const { data } = await api.get(`/orders/${code}/invoice`)
      setInvoice(data)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setInvoiceLoading(false)
    }
  }

  function paymentCard(messageOrder) {
    return (
      <div className="mt-2 min-w-56 rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-sm sm:min-w-64">
        <p className="font-semibold text-text-primary">{messageOrder.quantity} × {messageOrder.product}</p>
        <p className="mt-1 text-sm text-text-secondary">{t("Total")}: <strong className="text-text-primary">{money(messageOrder.amount)}</strong></p>
        {messageOrder.paymentStatus === "SUCCESS" ? (
          <div className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#168553]"><CheckCheck size={16} /> {t("Payment received")}</div>
        ) : (
          <>
            <p className="mt-2 text-xs text-text-secondary">{t("Payment ke liye yahan click karein:")}</p>
            <Button size="sm" className="mt-2 w-full" onClick={() => navigate(`/mock-payment/${messageOrder.orderId}`)}>{t("Pay {amount}", { amount: money(messageOrder.amount) })}</Button>
            <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-700">{t("Demo payment only")}</p>
          </>
        )}
        <p className="mt-2 text-[11px] text-text-muted">{t("Order {id}", { id: messageOrder.orderId })}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={t("WhatsApp Order Demo")} description={t("Try a customer chat, mock payment, and invoice without external services.")} />
      {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{t(error)}</div>}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-bold">DEMO</span>{t("WhatsApp and payment are simulated. No external messages or payments occur.")}</div>

      <div className="grid overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:min-h-[690px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-[#fbfcfd] lg:block">
          <div className="flex h-[68px] items-center justify-between border-b border-border px-5"><h2 className="font-semibold text-text-primary">{t("Chats")}</h2><MessageCircle size={18} className="text-[#168553]" /></div>
          <div className="border-b border-border bg-[#f0f7f4] p-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d9fdd3] text-[#168553]"><Store size={20} /></div><div><p className="font-semibold text-text-primary">{t("Demo Customer")}</p><p className="text-xs text-text-secondary">{t("WhatsApp Order Demo")}</p></div></div></div>
          <div className="p-4 text-xs leading-5 text-text-secondary">{t("Send a message like: bhai 1 amul doodh bhej dena")}</div>
        </aside>

        <section className="flex min-h-[620px] min-w-0 flex-col">
          <header className="flex h-[68px] items-center gap-3 border-b border-border bg-white px-4 sm:px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d9fdd3] text-[#168553]"><Store size={19} /></div>
            <div><h2 className="font-semibold text-text-primary">{t("Sharma General Store")}</h2><p className="text-xs text-[#168553]">{t("Demo store assistant")}</p></div>
            <span className="ml-auto rounded-full bg-[#e8f5e9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#168553]">{t("Simulated")}</span>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#efeae2] bg-[radial-gradient(#d7d0c5_0.6px,transparent_0.6px)] bg-[size:12px_12px] p-4 sm:p-6">
            {!thread.length && <div className="mx-auto mt-8 max-w-md rounded-xl bg-[#fff7d6] px-4 py-3 text-center text-sm text-[#6b5c2e] shadow-sm">{t("This is a demo chat. Try the sample message below.")}</div>}
            {thread.map((item, index) => (
              <div key={`${index}-${item.role}`} className={`flex ${item.role === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-xl px-3 py-2 shadow-sm sm:max-w-[75%] ${item.role === "customer" ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tl-sm bg-white"}`}>
                  {item.type === "summary" ? <div className="min-w-56 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-950"><div className="mb-1 flex items-center gap-1.5 font-semibold"><Sparkles size={15} className="text-violet-600" />{t("Order summary")}</div><p className="leading-5">{item.summary?.text}</p><p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-violet-700">{t("Matched with current inventory")}</p></div> : item.type === "payment" ? <><p className="whitespace-pre-line text-sm leading-5 text-text-primary">{t("Order ready for payment:")}</p>{paymentCard(item.order)}</> : item.type === "confirmation" ? (
                    <div className="text-sm leading-6 text-text-primary"><p>{t("✅ Payment received!")}</p><p>{t("Your order #{id} is confirmed.", { id: item.order.orderId })}</p><p className="mt-1">{t("🚚 Your order will be delivered soon.")}</p><p>{t("Thank you! 🙏")}</p><Button size="sm" variant="secondary" className="mt-2" disabled={invoiceLoading} onClick={() => showInvoice(item.order.orderId)}>{invoiceLoading ? t("Loading invoice…") : t("🧾 View Invoice")}</Button></div>
                  ) : <p className="whitespace-pre-wrap text-sm leading-5 text-text-primary">{item.text}</p>}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-border bg-[#f7f8fa] p-3 sm:gap-3 sm:px-5">
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("Type a customer message…")} className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-sm text-text-primary outline-none focus:border-[#25a366]" />
            <Button type="submit" disabled={sending || !message.trim()} className="h-11 w-11 shrink-0 !rounded-full !p-0" aria-label={t("Send message")}>{sending ? <span className="animate-pulse">…</span> : <Send size={17} />}</Button>
          </form>
          <div className="border-t border-border bg-white px-4 py-2 text-xs text-text-muted sm:px-5">{t("Try:")} <button type="button" className="font-medium text-[#168553] hover:underline" onClick={() => setMessage("bhai 1 amul doodh bhej dena")}>“bhai 1 amul doodh bhej dena”</button></div>
        </section>
      </div>

      {invoice && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setInvoice(null) }}>
        <Card className="w-full max-w-lg" role="dialog" aria-modal="true" aria-label={t("Tax invoice")}>
          <div className="flex items-start justify-between border-b border-border pb-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#007eb5]">{t("Tax invoice · Demo")}</p><h2 className="mt-1 text-xl font-bold text-text-primary">{invoice.storeName}</h2><p className="mt-1 text-xs text-text-secondary">{t("Invoice {id}", { id: invoice.invoiceId })}</p></div><button onClick={() => setInvoice(null)} className="rounded-full p-2 text-text-secondary hover:bg-gray-100" aria-label={t("Close invoice")}><X size={18} /></button></div>
          <div className="space-y-3 py-4 text-sm"><div className="flex justify-between"><span className="text-text-secondary">{t("Order")}</span><strong>{invoice.orderId}</strong></div><div className="flex justify-between"><span className="text-text-secondary">{t("Customer")}</span><strong>{invoice.customerName}</strong></div><div className="flex justify-between"><span className="text-text-secondary">{t("Date")}</span><strong>{new Date(invoice.createdAt).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN")}</strong></div></div>
          <div className="border-y border-dashed border-border py-4"><div className="grid grid-cols-[1fr_auto_auto] gap-4 text-xs font-semibold uppercase text-text-muted"><span>{t("Product")}</span><span>{t("Qty")}</span><span>{t("Price")}</span></div><div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-4 text-sm"><span className="font-medium text-text-primary">{invoice.product}</span><span>{invoice.quantity}</span><span>{money(invoice.unitPrice * invoice.quantity)}</span></div><p className="mt-3 text-xs text-text-secondary">{t("Unit price")}: {money(invoice.unitPrice)}</p></div>
          <div className="flex justify-between py-4"><span className="font-semibold text-text-primary">{t("Total")}</span><strong className="text-xl text-[#007eb5]">{money(invoice.total)}</strong></div>
          <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm"><span className="text-text-secondary">{t("Payment status")}</span><span className="font-bold text-[#168553]">{t("SUCCESS (DEMO)")}</span></div>
          <p className="mt-4 text-center text-sm text-text-secondary">{t("Thank you for your order!")}</p>
        </Card>
      </div>}
    </div>
  )
}

export default WhatsAppOrderDemo
