import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from './Button';

export function Pagination({ currentPage, totalItems, pageSize = 10, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[rgba(255,255,255,0.05)] bg-[#111625]">
      <span className="text-[11px] font-medium text-[#475569]">
        Page <strong className="text-[#F8FAFC] font-semibold">{currentPage}</strong> of{' '}
        <strong className="text-[#F8FAFC] font-semibold">{totalPages}</strong> ({totalItems} items)
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={FiChevronLeft}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={FiChevronRight}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
