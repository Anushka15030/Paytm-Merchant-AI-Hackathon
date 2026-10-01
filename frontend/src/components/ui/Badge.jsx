const variants = {
  default: "bg-gray-100 text-text-secondary",
  primary: "bg-primary-light text-primary",
  success: "bg-green-50 text-success",
  warning: "bg-orange-50 text-warning",
  danger: "bg-red-50 text-danger",
  info: "bg-blue-50 text-info",
}

function Badge({
  children,
  variant = "default",
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        px-2.5 py-1
        text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge