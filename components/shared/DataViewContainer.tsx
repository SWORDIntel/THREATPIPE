
import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number; // Optional: for displaying total item count
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange, totalItems }) => {
    if (totalPages <= 1) return null;
    
    const itemsPerPage = totalItems && totalPages > 0 ? Math.ceil(totalItems / totalPages) : 0;
    const startItem = itemsPerPage > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = itemsPerPage > 0 ? Math.min(currentPage * itemsPerPage, totalItems || 0) : 0;

    return (
        <nav className="flex items-center justify-between border-t border-brand-border px-4 sm:px-0 mt-8 pt-4">
            <div>
                {(totalItems !== undefined && totalItems > 0 && itemsPerPage > 0) && (
                  <p className="text-sm text-brand-text-secondary">
                    Showing <span className="font-medium text-brand-text-primary">{startItem}</span>
                    {' '}to <span className="font-medium text-brand-text-primary">{endItem}</span>
                    {' '}of <span className="font-medium text-brand-text-primary">{totalItems}</span> results
                  </p>
                )}
                 {(totalItems === 0) && (
                    <p className="text-sm text-brand-text-secondary">No results</p>
                )}
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-brand-border text-sm font-medium rounded-md text-brand-text-primary bg-brand-surface-alt hover:bg-brand-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-brand-border text-sm font-medium rounded-md text-brand-text-primary bg-brand-surface-alt hover:bg-brand-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        </nav>
    );
};

interface DataViewContainerProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  searchFilter?: (item: T) => boolean;
  className?: string;
  emptyStateMessage?: string;
}

export function DataViewContainer<T>({ 
  items, 
  renderItem, 
  currentPage, 
  totalPages,
  totalItems,
  onPageChange,
  searchFilter, 
  className = "space-y-6",
  emptyStateMessage = "No data available or matches your search."
}: DataViewContainerProps<T>) {

  const displayItems = searchFilter ? items.filter(searchFilter) : items;

  if (displayItems.length === 0) {
    return <p className="text-center text-brand-text-secondary py-8">{emptyStateMessage}</p>;
  }
  
  const itemsPerPage = totalItems && totalPages > 0 ? Math.ceil(totalItems / totalPages) : displayItems.length || 0;


  return (
    <div>
      <div className={className}>
        {displayItems.map((item, index) => renderItem(item, (currentPage -1) * itemsPerPage + index))}
      </div>
      <PaginationControls 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange}
        totalItems={totalItems}
      />
    </div>
  );
}