import React from 'react';

export const PrimaryButton = React.memo(function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  size = 'md',
  fullWidth = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 rounded-lg',
    md: 'px-3.5 py-2 text-xs font-semibold gap-2 rounded-xl',
    lg: 'px-4 py-2.5 text-sm font-semibold gap-2 rounded-xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
        sizeClasses[size] || sizeClasses.md
      } ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
});

export default PrimaryButton;
