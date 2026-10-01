import { useT } from "../lib/i18n"

function Campaigns() {
  const t = useT()
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">
        {t("Campaigns")}
      </h1>

      <p className="mt-1 text-sm text-text-secondary">
        {t("Create and manage campaigns.")}
      </p>
    </div>
  )
}

export default Campaigns
