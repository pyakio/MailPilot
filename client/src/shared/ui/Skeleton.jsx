import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-[#161C2E] rounded-mp-sm ${className}`}
    />
  );
}

export default Skeleton;
