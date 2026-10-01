import Badge from "./Badge"

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
  const config = statusConfig[status] || {
    label: status,
    variant: "default",
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export default StatusBadge