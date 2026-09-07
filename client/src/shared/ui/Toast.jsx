import React from 'react';

export function Toast({ title, message, type = 'info', onClose }) {
  const typeStyles = {
    info: 'border-[#3E6B70]/50 bg-[var(--surface-card)] text-[var(--text)]',
    success: 'border-[#22C55E]/50 bg-[var(--surface-card)] text-[var(--text)]',
    warning: 'border-[#E8A33D]/50 bg-[var(--surface-card)] text-[var(--text)]',
    error: 'border-[#EF4444]/50 bg-[var(--surface-card)] text-[var(--text)]',
  };

  return (
    <div
      className={`max-w-sm w-full p-4 rounded-[12px] border shadow-2xl flex items-start justify-between gap-3 ${
        typeStyles[type] || typeStyles.info
      }`}
    >
      <div>
        {title && <h5 className="text-xs font-semibold text-[var(--text)]">{title}</h5>}
        {message && <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-xs font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Toast;
