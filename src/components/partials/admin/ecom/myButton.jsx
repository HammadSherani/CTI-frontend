import { Icon } from "@iconify/react";
import React from "react";

const Button = ({
  onClick,
  label,        
  title,       
  icon,
  disabled = false,
  loading = false,
  className = "",
  variant = "primary",
  type = "button",
  children,
}) => {
  const base = "h-11 px-6 flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all";

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${base} ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          {icon && <Icon icon={icon} className="w-4 h-4" />}
          {children || label}  
        </>
      )}
    </button>
  );
};

export default Button;