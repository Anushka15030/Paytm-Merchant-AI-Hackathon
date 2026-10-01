import { useT } from "../lib/i18n"

function Notifications() {
  const t = useT()
  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">
        {t("Notifications")}
      </h1>

      <p className="mt-1 text-sm text-text-secondary">
        {t("Your latest merchant notifications.")}
      </p>
    </div>
  )
}

export default Notifications
