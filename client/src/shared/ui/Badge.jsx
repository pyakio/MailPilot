import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variantStyles = {
    default: 'bg-[#171A20] text-[#9CA3AF] border border-[rgba(255,255,255,0.08)]',
    success: 'bg-[#22C55E]/15 text-[#4ADE80] border border-[#22C55E]/30',
    warning: 'bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30',
    danger: 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30',
    steel: 'bg-[#3E6B70]/25 text-[#76A8AD] border border-[#3E6B70]/40',
    amber: 'bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30',
    accent: 'bg-[#E8A33D]/15 text-[#E8A33D] border border-[#E8A33D]/30',
  };


  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[12px] font-medium rounded-[6px] ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
