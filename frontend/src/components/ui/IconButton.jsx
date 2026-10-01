function IconButton({
  children,
  label,
  size = "md",
  className = "",
  onClick,
}) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        rounded-full
        text-text-secondary
        hover:bg-primary-light hover:text-primary
        transition-colors duration-150
        focus:outline-none focus:ring-4 focus:ring-primary/20
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export default IconButton