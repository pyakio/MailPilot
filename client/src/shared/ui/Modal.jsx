import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-100"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-[var(--surface-card)] border border-[var(--border)] rounded-[14px] shadow-2xl p-4 sm:p-6 z-10 animate-scale-in max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-start justify-between mb-4 border-b border-[var(--border)] pb-3 shrink-0">
          <div className="min-w-0 pr-3">
            {title && (
              <h3 className="text-lg sm:text-[20px] font-semibold font-heading text-[var(--text)] tracking-tight truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-[8px] hover:bg-[var(--surface-hover)] transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)] pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
