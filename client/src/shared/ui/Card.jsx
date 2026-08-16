import React from 'react';

export function Card({
  children,
  title,
  subtitle,
  action,
  noPadding = false,
  className = '',
  headerClassName = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--surface-card)] border border-[var(--border)] rounded-[12px] card-depth-shadow card-hover transition-colors duration-150 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <div className={`px-[28px] py-[18px] border-b border-[var(--border)] flex items-center justify-between gap-4 ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="text-[17px] font-semibold text-[var(--text)] tracking-[-0.01em]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[13px] text-[var(--text-secondary)] mt-[2px]">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-[28px] space-y-[20px]'}>{children}</div>
    </div>
  );
}

export default Card;
