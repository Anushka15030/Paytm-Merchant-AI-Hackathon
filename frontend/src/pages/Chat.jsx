import { useEffect, useRef, useState } from "react"
import { ArrowUp, Bot, Plus, RotateCcw, Sparkles, UserRound } from "lucide-react"
import PageHeader from "../components/ui/PageHeader"
import api, { getApiError } from "../lib/api"
import { useT } from "../lib/i18n"

const suggestions = [
  "Which products are low on stock?",
  "Pichhle 7 din ki sales kaisi rahi?",
  "मेरे सबसे ज़्यादा बिकने वाले प्रोडक्ट कौन से हैं?",
]

function Chat() {
  const t = useT()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, pending])

  const send = async (retryText) => {
    const text = (retryText ?? draft).trim()
    if (!text || pending) return
    const prior = messages
    const next = [...prior, { role: "user", content: text }]
    setMessages(next)
    setDraft("")
    setError("")
    setPending(true)
    try {
      const history = prior.slice(-8).map(({ role, content }) => ({ role, content }))
      const { data } = await api.post("/chat", { message: text, history }, { timeout: 40000 })
      setMessages((current) => [...current, { role: "assistant", content: data.reply }])
    } catch (requestError) {
      setError(getApiError(requestError))
      setMessages(prior)
      setDraft(text)
    } finally {
      setPending(false)
      inputRef.current?.focus()
    }
  }

  const newConversation = () => {
    setMessages([])
    setError("")
    setDraft("")
    inputRef.current?.focus()
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col">
      <PageHeader title={t("Ask your business")} description={t("Get answers from your current products, stock, sales, and orders.")} action={
        <button onClick={newConversation} type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-text-primary hover:bg-[#f5f9fc]">
          <Plus size={16} /> {t("New conversation")}
        </button>
      } />

      <section className="flex min-h-[min(68vh,720px)] flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_6px_24px_rgb(18_50_85/4%)]" aria-label={t("Merchant chat")}>
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-[#007eb5]"><Sparkles size={19} /></div>
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-text-primary">{t("Merchant Copilot")}</p><p className="text-xs text-text-secondary">{t("Grounded in live dashboard data")}</p></div>
          <span className="hidden rounded-full bg-[#f5f9fc] px-3 py-1 text-xs text-text-secondary sm:inline">{t("Hindi · Hinglish · English")}</span>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-8" aria-live="polite">
          {!messages.length && !pending && <div className="mx-auto flex min-h-[340px] max-w-xl flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-[#007eb5]"><Bot size={27} /></div>
            <h2 className="mt-4 text-lg font-semibold text-text-primary">{t("What would you like to know?")}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{t("Ask about products, stock levels, recorded sales, or recent orders. Answers use the data currently available in your dashboard.")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)} className="rounded-full border border-border bg-white px-3 py-2 text-left text-xs text-text-primary transition hover:border-[#8adcf4] hover:bg-[#f1fbfe]">{suggestion}</button>)}</div>
          </div>}

          {messages.map((message, index) => <article key={`${index}-${message.role}`} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === "user" ? "bg-[#e9efff] text-[#174b90]" : "bg-primary-light text-[#007eb5]"}`}>{message.role === "user" ? <UserRound size={16} /> : <Bot size={17} />}</div>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${message.role === "user" ? "rounded-tr-md bg-[#0750b5] text-white" : "rounded-tl-md bg-[#f5f8fc] text-text-primary"}`}>{message.content}</div>
          </article>)}
          {pending && <div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-[#007eb5]"><Bot size={17} /></div><div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-[#f5f8fc] px-4 py-4" aria-label={t("Thinking")}><span className="chat-dot"/><span className="chat-dot delay-1"/><span className="chat-dot delay-2"/></div></div>}
          {error && <div role="alert" className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{t("Couldn’t get a reply: {error}", { error: t(error) })}</span><button type="button" onClick={() => send(draft)} disabled={pending || !draft.trim()} className="inline-flex shrink-0 items-center gap-1 font-semibold hover:underline disabled:opacity-50"><RotateCcw size={14} /> {t("Retry")}</button></div>}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={(event) => { event.preventDefault(); send() }} className="border-t border-border bg-white p-3 sm:p-5">
          <div className="flex items-end gap-2 rounded-2xl border border-[#dce5ee] bg-white p-2 shadow-sm focus-within:border-[#00baf2] focus-within:ring-4 focus-within:ring-primary/10">
            <textarea ref={inputRef} rows={1} maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send() } }} placeholder={t("Ask in English, हिंदी, or Hinglish…")} aria-label={t("Your message")} className="max-h-32 min-h-10 flex-1 resize-y border-0 bg-transparent px-2 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-0" />
            <button type="submit" disabled={!draft.trim() || pending} aria-label={t("Send message")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0750b5] text-white transition hover:bg-[#063f91] disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp size={19} /></button>
          </div>
          <p className="mt-2 text-center text-[11px] text-text-muted">{t("Replies use current dashboard data. This conversation is not saved as cross-session memory.")}</p>
        </form>
      </section>
    </div>
  )
}

export default Chat
