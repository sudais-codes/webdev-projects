import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowDown,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  RotateCcw as RefreshIcon,
  ShoppingBag,
} from 'lucide-react';
import { fetchAllProducts, fetchCategories, fetchProductsByCategory, normalizeImageUrl } from '../services/api';
import { formatPrice } from '../context/StoreContext';
import ProductGrid from '../components/ProductGrid';

export default function Home({ scrollToProducts: initialScroll = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Products and categories state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset to first page when any search, filter, or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  // Handle scroll to products if /shop route or prop
  useEffect(() => {
    if (initialScroll || location.pathname === '/shop') {
      const timer = setTimeout(() => {
        const el = document.getElementById('products-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialScroll, location.pathname]);

  // Initial load of products and categories
  const loadInitialData = useCallback(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    setError(null);

    // Use Promise.allSettled so that categories failing will NEVER prevent products from loading!
    Promise.allSettled([
      fetchAllProducts({ signal: controller.signal }),
      fetchCategories({ signal: controller.signal }),
    ])
      .then(([productsResult, categoriesResult]) => {
        if (!isMounted) return;

        if (productsResult.status === 'fulfilled' && Array.isArray(productsResult.value)) {
          setProducts(productsResult.value);
        } else if (productsResult.status === 'rejected') {
          const err = productsResult.reason;
          if (err?.name !== 'AbortError') {
            console.error('[NEXORA] Failed to load products:', err);
            setError(err?.message || 'Unable to retrieve products from the store catalog.');
          }
        }

        if (categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value)) {
          setCategories(categoriesResult.value);
        } else {
          console.warn('[NEXORA] Categories could not be loaded, continuing with default list');
        }

        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.name !== 'AbortError') {
          setError(err?.message || 'Failed to connect to the store API.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const cleanup = loadInitialData();
    return cleanup;
  }, [loadInitialData]);

  // When selected category changes, optionally fetch from category endpoint to verify category API
  const handleCategoryChange = async (cat) => {
    setSelectedCategory(cat);

    if (cat === 'all') {
      return;
    }

    try {
      setIsCategoryLoading(true);
      const catProducts = await fetchProductsByCategory(cat);
      if (Array.isArray(catProducts) && catProducts.length > 0) {
        // useMemo filter handles view
      }
    } catch (e) {
      console.warn('[NEXORA] Category endpoint fetch notice, using catalog filter:', e.message);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
  };

  // Determine if any filter is active
  const isFiltered = Boolean(
    searchTerm.trim() ||
    selectedCategory !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'default'
  );

  // Filter and sort products (derived state using useMemo without mutating original catalog)
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let list = [...products];

    // 1. Search filter by title (case-insensitive, trimmed)
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (cleanSearch) {
      list = list.filter((p) => (p.title || '').toLowerCase().includes(cleanSearch));
    }

    // 2. Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Price filter
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!isNaN(min) && min >= 0) {
      list = list.filter((p) => Number(p.price) >= min);
    }
    if (!isNaN(max) && max >= 0) {
      const effectiveMax = !isNaN(min) && max < min ? min : max;
      list = list.filter((p) => Number(p.price) <= effectiveMax);
    }

    // 4. Sorting (immutable)
    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
      case 'rating-desc':
        list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'default':
      default:
        break;
    }

    return list;
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  // Pagination calculations to prevent endless 194-product scrolling
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalItems > 0 ? (validCurrentPage - 1) * itemsPerPage : 0;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const spotlightProduct = products && products.length > 0 ? products[0] : null;

  return (
    <div>
      {/* A. HERO SECTION */}
      <section className="hero-section" aria-label="NEXORA Online Shop Introduction">
        <div className="hero-content">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>Spring &bull; Summer 2026 Collection</span>
          </div>

          <h1 className="hero-title">
            Exceptional Design, Curated for Modern Living.
          </h1>

          <p className="hero-description">
            Discover a handpicked collection of luxury beauty, high-performance electronics,
            and timeless everyday essentials crafted with uncompromising quality.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              onClick={scrollToProducts}
              className="btn-primary btn-lg"
              aria-label="Shop our product collection"
            >
              <span>Explore Collection</span>
              <ArrowDown size={18} />
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Over <strong>{products.length || 190}+</strong> authentic products available
            </span>
          </div>

          <div className="hero-features">
            <div className="hero-feature-item">
              <Truck size={16} color="var(--color-brand)" />
              <span>Free Delivery &gt; $100</span>
            </div>
            <div className="hero-feature-item">
              <ShieldCheck size={16} color="var(--color-accent)" />
              <span>100% Authentic Guarantee</span>
            </div>
            <div className="hero-feature-item">
              <RefreshIcon size={16} color="var(--color-warning)" />
              <span>30-Day Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Visual Preview Card */}
        <div className="hero-visual" aria-hidden="true">
          <div
            className="hero-card-preview"
            onClick={() => spotlightProduct && navigate(`/product/${spotlightProduct.id}`)}
            style={{ cursor: spotlightProduct ? 'pointer' : 'default' }}
          >
            <div className="hero-card-badge">
              <span className="badge badge-accent">Featured Spotlight</span>
              <span className="badge badge-brand">★ {spotlightProduct?.rating ? Number(spotlightProduct.rating).toFixed(1) : '4.9'}</span>
            </div>
            <div className="hero-card-img-wrap">
              <img
                src={
                  spotlightProduct?.thumbnail
                    ? normalizeImageUrl(spotlightProduct.thumbnail)
                    : '/cdn-images/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp'
                }
                alt={spotlightProduct?.title || 'NEXORA Curated Spotlight'}
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200" fill="%23F1F5F9"><rect width="300" height="200" fill="%23F1F5F9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="%231D4ED8">NEXORA LUXURY</text></svg>';
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {spotlightProduct?.title || 'Essence Mascara Lash Princess'}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-brand)', fontWeight: 600 }}>
                  {spotlightProduct?.price ? formatPrice(spotlightProduct.price) : '$9.99'}
                </p>
              </div>
              <span className="badge badge-success">In Stock</span>
            </div>
          </div>
        </div>
      </section>

      {/* B, C, D, E: SEARCH & FILTER CONTROLS */}
      <section id="products-section" aria-label="Product Search and Filters">
        <div className="controls-container">
          {/* Main Controls Row: Search, Category, Sort */}
          <div className="controls-main-row">
            {/* Search Input */}
            <div className="search-input-wrap">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search products by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products by title"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search input"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div>
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                aria-label="Filter products by category"
              >
                <option value="all">All Categories ({categories.length})</option>
                {categories.map((cat) => {
                  const slug = typeof cat === 'string' ? cat : cat.slug || cat.name || String(cat);
                  const label = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
                  return (
                    <option key={slug} value={slug}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Price Range Controls & Filter Reset */}
          <div className="price-filters-row">
            <div className="price-inputs-group">
              <span className="price-input-label">
                <SlidersHorizontal size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Price Range ($):
              </span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min $"
                className="price-input"
                value={minPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) setMinPrice(val);
                }}
                aria-label="Minimum price in dollars"
              />
              <span style={{ color: 'var(--text-muted)' }}>–</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max $"
                className="price-input"
                value={maxPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || Number(val) >= 0) setMaxPrice(val);
                }}
                aria-label="Maximum price in dollars"
              />
            </div>

            {/* Active Filter Indicators & Reset Button */}
            <div className="active-filters-chips">
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-secondary btn-sm"
                  aria-label="Reset all search and filter values"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Metadata Summary & Per-Page Controls */}
        <div className="results-meta-bar">
          <div className="results-meta-info">
            <span>
              Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</strong> of{' '}
              <strong>{totalItems}</strong> products
              {selectedCategory !== 'all' && ` in "${selectedCategory.replace(/-/g, ' ')}"`}
            </span>
            {isCategoryLoading && (
              <span className="badge badge-subtle">
                Updating...
              </span>
            )}
            {isFiltered && !isCategoryLoading && (
              <span className="badge badge-brand">
                Filtered Active
              </span>
            )}
          </div>

          {totalItems > 0 && (
            <div className="per-page-controls">
              <label htmlFor="per-page-select" className="per-page-label">
                Show:
              </label>
              <select
                id="per-page-select"
                className="per-page-select"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                aria-label="Products per page"
              >
                <option value={12}>12 per page</option>
                <option value={16}>16 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
          )}
        </div>

        {/* F. PRODUCT GRID */}
        <ProductGrid
          products={paginatedProducts}
          totalProducts={totalItems}
          currentPage={validCurrentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          error={error}
          onRetry={loadInitialData}
          isFiltered={isFiltered}
          onResetFilters={handleResetFilters}
        />
      </section>
    </div>
  );
}
