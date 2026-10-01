const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus:ring-primary/30",
  secondary:
    "bg-white text-text-primary border border-border hover:bg-gray-50 focus:ring-primary/20",
  light:
    "bg-white text-[#006da9] border border-white/70 hover:bg-[#eefaff] focus:ring-white/30",
  danger:
    "bg-danger text-white hover:bg-red-600 focus:ring-danger/30",
  ghost:
    "bg-transparent text-text-primary hover:bg-gray-100 focus:ring-primary/20",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
}

function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  className = "",
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-button font-medium
        transition-colors duration-150
        focus:outline-none focus:ring-4
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export default Button
