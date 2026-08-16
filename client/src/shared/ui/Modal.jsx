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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-[var(--surface-card)] border border-[var(--border)] rounded-[14px] shadow-2xl p-6 overflow-hidden z-10 anim-hover transition-colors duration-150`}
      >
        <div className="flex items-start justify-between mb-5 border-b border-[var(--border)] pb-3">
          <div>
            {title && <h3 className="text-[20px] font-semibold font-heading text-[var(--text)]">{title}</h3>}
            {subtitle && <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] rounded-[8px] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
