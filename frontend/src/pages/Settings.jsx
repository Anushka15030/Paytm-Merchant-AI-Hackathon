import { useT } from "../lib/i18n"

function Settings() {
  const t = useT()
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">
        {t("Settings")}
      </h1>

      <p className="mt-1 text-sm text-text-secondary">
        {t("Manage your merchant preferences.")}
      </p>
    </div>
  )
}

export default Settings
