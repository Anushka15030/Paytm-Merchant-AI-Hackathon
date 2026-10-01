function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
}) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  }

  return (
    <div
      className={`
        rounded-card
        bg-surface
        border border-border
        shadow-sm
        ${paddings[padding]}
        ${hover ? "transition-shadow duration-150 hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card