import React from 'react';

export function Toast({ title, message, type = 'info', onClose }) {
  const typeStyles = {
    info: 'border-[#6366F1]/30 bg-[#111625] text-[#F8FAFC]',
    success: 'border-[#22C55E]/30 bg-[#111625] text-[#F8FAFC]',
    warning: 'border-[#F59E0B]/30 bg-[#111625] text-[#F8FAFC]',
    error: 'border-[#EF4444]/30 bg-[#111625] text-[#F8FAFC]',
  };

  return (
    <div
      className={`max-w-sm w-full p-4 rounded-mp-md border shadow-lg flex items-start justify-between gap-3 ${
        typeStyles[type] || typeStyles.info
      }`}
    >
      <div>
        {title && <h5 className="text-xs font-semibold text-[#F8FAFC]">{title}</h5>}
        {message && <p className="text-[11px] text-[#94A3B8] mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-[#475569] hover:text-[#F8FAFC] transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Toast;
