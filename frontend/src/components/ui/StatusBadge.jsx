import Badge from "./Badge"
import { useT } from "../../lib/i18n"

const statusConfig = {
  low_stock: {
    label: "Low Stock",
    variant: "danger",
  },
  healthy: {
    label: "Healthy",
    variant: "success",
  },
  overstock: {
    label: "Overstock",
    variant: "warning",
  },
  paid: {
    label: "Paid",
    variant: "success",
  },
  pending: {
    label: "Pending",
    variant: "warning",
  },
  completed: {
    label: "Completed",
    variant: "success",
  },
  cancelled: {
    label: "Cancelled",
    variant: "danger",
  },
}

function StatusBadge({ status }) {
  const t = useT()
  const config = statusConfig[status] || {
    label: status,
    variant: "default",
  }

  return (
    <Badge variant={config.variant}>
      {t(config.label)}
    </Badge>
  )
}

export default StatusBadge
