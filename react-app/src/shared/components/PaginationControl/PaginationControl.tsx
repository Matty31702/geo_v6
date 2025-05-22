import React from "react";

interface PaginationControlProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const PaginationControl: React.FC<PaginationControlProps> = ({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  className = "",
}) => {
  const lastPage = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Prevent invalid page numbers
  if (currentPage < 1 || currentPage > lastPage) {
    currentPage = Math.max(1, Math.min(currentPage, lastPage));
  }

  // Calculate what items are being shown
  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Function to handle navigation
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, lastPage));
    onPageChange(validPage);
  };
  
  // Create page number buttons with intelligent ellipsis display
  const renderPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    
    // Always include first page
    pageNumbers.push(1);
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pageNumbers.push("ellipsis-start");
    }
    
    // Add pages around the current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
      if (i > 1 && i < lastPage) {
        pageNumbers.push(i);
      }
    }
    
    // Add ellipsis if needed
    if (currentPage < lastPage - 2) {
      pageNumbers.push("ellipsis-end");
    }
    
    // Always include last page if it's not page 1
    if (lastPage > 1) {
      pageNumbers.push(lastPage);
    }
    
    return pageNumbers;
  };

  // Don't render pagination if there are no items
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 ${className}`}>
      {/* Mobile pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Previous page"
        >
          Previous
        </button>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === lastPage}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === lastPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
      
      {/* Desktop pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {totalItems > 0 ? (
              <>
                Showing <span className="font-medium">{startIndex}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{totalItems}</span> results
              </>
            ) : (
              <span className="font-medium">No results found</span>
            )}
          </p>
        </div>
        
        {totalItems > 0 && (
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* Previous button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
                aria-label="Previous page"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>
              
              {/* Page numbers */}
              {renderPageNumbers().map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                    >
                      &hellip;
                    </span>
                  );
                }
                
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => goToPage(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === page
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    } text-sm font-medium`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                );
              })}
              
              {/* Next button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === lastPage}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                  currentPage === lastPage
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
                aria-label="Next page"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginationControl;