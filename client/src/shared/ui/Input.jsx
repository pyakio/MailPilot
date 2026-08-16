import React from 'react';

export const Input = React.memo(function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[12px] font-mono font-medium text-[var(--text-secondary)] uppercase mb-1.5">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full h-[42px] px-3.5 text-[14px] bg-[var(--surface-secondary)] text-[var(--text)] placeholder-[var(--text-muted)] border border-[var(--border)] rounded-[8px] focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] disabled:opacity-50 transition-colors ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{error}</p>}
    </div>
  );
});

export default Input;
