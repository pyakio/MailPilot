import React from 'react';
import Button from './Button';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-[#161C2E] border border-[rgba(255,255,255,0.05)] flex items-center justify-center text-[#94A3B8] mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h4 className="text-xs font-semibold text-[#F8FAFC]">{title}</h4>
      {description && (
        <p className="text-[11px] text-[#94A3B8] max-w-sm mt-1 mb-5">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
