import { useT } from "../../lib/i18n"

function PaytmBusinessLogo({ compact = false }) {
  const t = useT()
  return (
    <div className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`} role="img" aria-label={t("Paytm for Business")}>
      <div className="brand-mark" aria-hidden="true">
        <span className="brand-pay">pay</span><span className="brand-tm">tm</span>
      </div>
      <div className="brand-for-row" aria-hidden="true">
        <span className="brand-rule" />
        <span className="brand-for">{t("for")}</span>
        <span className="brand-rule" />
      </div>
      <div className="brand-business-name" aria-hidden="true">{t("Business")}</div>
    </div>
  )
}

export default PaytmBusinessLogo
