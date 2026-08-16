import React from 'react';

export const Button = React.memo(function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'steel' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    xs: 'h-[28px] px-[10px] text-[11px] rounded-[6px] gap-1 font-medium tracking-tight',
    sm: 'h-[32px] px-[12px] text-[12px] rounded-[6px] gap-1.5 font-medium tracking-tight',
    md: 'h-[40px] px-[16px] text-[14px] rounded-[8px] gap-2 font-semibold tracking-tight',
    lg: 'h-[46px] px-[20px] text-[15px] rounded-[8px] gap-2.5 font-semibold tracking-tight',
  };

  const variantClasses = {
    primary:
      'bg-[#E8A33D] hover:bg-[#D9932E] text-[#14171C] font-semibold border border-[#E8A33D] btn-hover shadow-sm',
    secondary:
      'bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)] btn-hover shadow-xs',
    steel:
      'bg-[#3E6B70] hover:bg-[#4E8187] text-white border border-[#3E6B70] btn-hover shadow-xs',
    outline:
      'bg-transparent hover:bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border-strong)] btn-hover shadow-xs',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] border-0 transition-colors shadow-none',
    danger:
      'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/25 btn-hover shadow-none',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
        variantClasses[variant] || variantClasses.primary
      } ${sizeClasses[size] || sizeClasses.md} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

export default Button;
