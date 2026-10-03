import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle2, LockKeyhole, PackageCheck, ShieldCheck, Volume2 } from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import PaytmBusinessLogo from "../components/layout/PaytmBusinessLogo"
import api, { getApiError } from "../lib/api"
import { useLocale, useT } from "../lib/i18n"

function MockPayment() {
  const t = useT()
  const { locale } = useLocale()
  const { orderCode } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [error, setError] = useState("")
  const money = (value) => new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0)
  const announcementAmount = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value) || 0)

  function announcePayment(amount) {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return
    const formattedAmount = announcementAmount(amount)
    const utterance = new SpeechSynthesisUtterance(`Paytm par ${formattedAmount} rupaye prapt hue.`)
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find((voice) => voice.lang?.toLowerCase() === "hi-in")
      || voices.find((voice) => voice.lang?.toLowerCase().startsWith("hi"))
    if (hindiVoice) utterance.voice = hindiVoice
    utterance.lang = hindiVoice?.lang || "hi-IN"
    utterance.rate = 0.92
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    let active = true
    api.get(`/orders/${orderCode}`).then(({ data }) => {
      if (!active) return
      setOrder(data)
      if (data.paymentStatus === "SUCCESS") {
        setPaymentResult(data)
        setPaid(true)
      }
    }).catch((requestError) => { if (active) setError(getApiError(requestError)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [orderCode])

  async function pay() {
    if (paying || !order) return
    setPaying(true)
    setError("")
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    try {
      const { data } = await api.post(`/payment/mock/${orderCode}`)
      setOrder(data)
      setPaymentResult(data)
      setPaid(true)
      announcePayment(data.amount)
    } catch (requestError) {
      setError(getApiError(requestError))
      setPaying(false)
    }
  }

  function continueToChat() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
    navigate(`/whatsapp-demo?order=${orderCode}`)
  }

  if (loading) return <div className="mx-auto flex min-h-96 max-w-xl items-center justify-center text-sm text-text-secondary">{t("Loading order…")}</div>
  if (!order) return <Card className="mx-auto mt-8 max-w-xl"><p className="text-text-primary">{error || t("Order not found")}</p><Button className="mt-4" variant="secondary" onClick={() => navigate("/whatsapp-demo")}>{t("Back to WhatsApp demo")}</Button></Card>

  return (
    <div className="mx-auto max-w-5xl py-3">
      <button onClick={() => navigate("/whatsapp-demo")} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"><ArrowLeft size={16} />{t("Back to WhatsApp")}</button>
      <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
        <div className="bg-gradient-to-r from-[#e8faff] to-white px-6 py-5 sm:px-8"><div className="flex items-center justify-between"><PaytmBusinessLogo /><span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">{t("Demo only")}</span></div><h1 className="mt-7 text-xl font-bold text-slate-900">{paid ? t("Payment Successful") : t("Complete Payment")}</h1><p className="mt-1 text-sm text-slate-600">{t("Secure demo checkout")}</p></div>
        <div className="px-6 py-6 sm:px-8">
          {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{t(error)}</div>}
          {paid ? <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white px-5 py-8 text-center sm:px-8"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"><CheckCircle2 size={42} className="text-[#168553]" /></div><p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-[#168553]">{t("✓ Payment successful")}</p><h2 className="mt-3 text-xl font-bold text-slate-900">{t("Paytm par ₹{amount} prapt hue.", { amount: announcementAmount(paymentResult?.amount ?? order.amount) })}</h2><p className="mt-4 text-3xl font-extrabold text-[#168553]">₹{announcementAmount(paymentResult?.amount ?? order.amount)} <span className="text-sm font-bold uppercase tracking-wide">{t("Received")}</span></p><Button variant="secondary" className="mt-5 gap-2" onClick={() => announcePayment(paymentResult?.amount ?? order.amount)}><Volume2 size={17} />{t("Replay announcement")}</Button><Button className="mt-3 w-full py-3 text-base" onClick={continueToChat}>{t("Continue to WhatsApp")}</Button><p className="mt-4 text-xs leading-5 text-text-muted">{t("Simulated Paytm-style payment voice. Not connected to a real Soundbox or payment service.")}</p></div> : <>
            <div className="rounded-xl border border-border bg-[#fbfcfe] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-text-muted">{t("Order")}</p><p className="mt-1 font-semibold text-text-primary">{order.orderId}</p></div><div className="text-right"><p className="text-xs uppercase tracking-wide text-text-muted">{t("Status")}</p><p className="mt-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{t("Payment pending")}</p></div></div><div className="my-4 border-t border-dashed border-border"/><div className="flex justify-between gap-4"><div><p className="font-semibold text-text-primary">{order.product}</p><p className="mt-1 text-sm text-text-secondary">{t("Quantity")}: {order.quantity} × {money(order.unitPrice)}</p></div><PackageCheck className="shrink-0 text-[#007eb5]" size={22} /></div></div>
            <div className="mt-5 flex items-center justify-between"><span className="text-sm font-medium text-text-secondary">{t("Amount")}</span><strong className="text-3xl font-bold text-slate-900">{money(order.amount)}</strong></div>
            <Button className="mt-6 w-full py-3 text-base" disabled={paying} onClick={pay}>{paying ? <span className="inline-flex items-center gap-2"><span className="animate-spin">◌</span>{t("Processing demo payment…")}</span> : t("Pay {amount}", { amount: money(order.amount) })}</Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted"><LockKeyhole size={13} />{t("Mock payment — no money will be charged")}</div>
            <div className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-3 text-xs leading-5 text-blue-900"><ShieldCheck size={16} className="mt-0.5 shrink-0" />{t("This is a hackathon demo checkout. It is not connected to Paytm or any payment gateway.")}</div>
          </>}
        </div>
      </div>
    </div>
  )
}

export default MockPayment
