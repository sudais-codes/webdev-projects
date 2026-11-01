import { AlertCircle, SearchX, RefreshCcw, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function ProductGrid({
  products = [],
  totalProducts = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange = null,
  isLoading = false,
  error = null,
  onRetry = null,
  isFiltered = false,
  onResetFilters = null,
}) {
  // Skeleton Loader State
  if (isLoading) {
    return (
      <div className="product-grid" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="skeleton-card">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-img" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-rating" />
            <div className="skeleton skeleton-price" />
            <div className="skeleton skeleton-btn" />
          </div>
        ))}
      </div>
    );
  }

  // Network or API Error State
  if (error) {
    return (
      <div className="state-container" role="alert">
        <div className="state-icon-wrap error">
          <AlertCircle size={32} />
        </div>
        <h3 className="state-title">Unable to Load Products</h3>
        <p className="state-desc">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            <RefreshCcw size={16} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // Empty Filter / Search State
  if (!products || products.length === 0) {
    return (
      <div className="state-container">
        <div className="state-icon-wrap info">
          {isFiltered ? <FilterX size={32} /> : <SearchX size={32} />}
        </div>
        <h3 className="state-title">No Products Found</h3>
        <p className="state-desc">
          {isFiltered
            ? 'We could not find any products matching your current search or filter criteria. Try broadening your terms or resetting filters.'
            : 'There are currently no products available in the catalog.'}
        </p>
        {isFiltered && onResetFilters && (
          <button type="button" onClick={onResetFilters} className="btn-secondary">
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Loaded Products Grid with Pagination
  return (
    <div className="products-grid-wrapper">
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <nav className="pagination-bar" aria-label="Product catalog pagination">
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="pagination-numbers-list">
            {pageNumbers.map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  type="button"
                  className={`pagination-num-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Go to next page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
