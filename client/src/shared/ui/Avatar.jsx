import React from 'react';

export function Avatar({ src, name = 'Alex Morgan', size = 'md', className = '' }) {
  const getInitials = (str) => {
    if (!str) return 'AK';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-12 h-12 text-[16px]',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-tr from-[#3B82F6] to-[#14B8A6] shrink-0 border border-[rgba(255,255,255,0.1)] ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
