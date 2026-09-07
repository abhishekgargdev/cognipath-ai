import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [6, 8, 12, 24],
  itemLabel = 'items',
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= (pageSize || 8))) {
    // If only 1 page and no size change needed, still show count if totalItems provided
    if (totalItems !== undefined && totalItems > 0) {
      return (
        <div className={`flex items-center justify-between py-3 px-1 text-xs font-serif text-[#5C5852] dark:text-[#9E9A91] border-t border-[#DCD9D1] dark:border-[#2C2A26] ${className}`}>
          <span className="font-mono text-[11px]">
            Showing all {totalItems} {itemLabel}
          </span>
          {pageSize && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs font-mono text-[#121212] dark:text-[#F4F2EC] focus:outline-none"
              >
                {pageSizeOptions.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  // Calculate start and end indices
  const startItem = totalItems !== undefined && pageSize !== undefined 
    ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
    : undefined;
  const endItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min(currentPage * pageSize, totalItems)
    : undefined;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Number of pages to show around current page

    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div 
      id="pagination-controls"
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 pb-2 border-t border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif ${className}`}
    >
      {/* Items Summary & Page Size */}
      <div className="flex items-center gap-3 text-[#5C5852] dark:text-[#9E9A91]">
        {startItem !== undefined && endItem !== undefined && totalItems !== undefined ? (
          <span className="font-mono text-[11px]">
            Showing <strong className="font-bold text-[#121212] dark:text-[#F4F2EC]">{startItem}–{endItem}</strong> of <strong className="font-bold text-[#121212] dark:text-[#F4F2EC]">{totalItems}</strong> {itemLabel}
          </span>
        ) : (
          <span className="font-mono text-[11px]">
            Page <strong className="font-bold text-[#121212] dark:text-[#F4F2EC]">{currentPage}</strong> of <strong className="font-bold text-[#121212] dark:text-[#F4F2EC]">{totalPages}</strong>
          </span>
        )}

        {pageSize && onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#DCD9D1] dark:border-[#2C2A26]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9E9A91]">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // Reset to page 1 on page size change
              }}
              className="px-1.5 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs font-mono text-[#121212] dark:text-[#F4F2EC] focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Navigation Buttons */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="First Page"
          aria-label="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-serif font-bold text-xs"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Pages */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-[#9E9A91] font-mono">
                  …
                </span>
              );
            }

            const pageNum = Number(page);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-xs text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                    : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center gap-1 font-serif font-bold text-xs"
          title="Next Page"
          aria-label="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Last Page"
          aria-label="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
