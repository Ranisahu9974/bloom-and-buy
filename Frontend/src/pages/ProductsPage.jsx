import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { getProducts } from '../api/productApi';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports',
  'Beauty',
  'Grocery',
  'Toys',
  'Automotive',
  'Other'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' }
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  // Local state for search input to allow smooth typing without immediate API calls
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // Ref to track the current abort controller for the products request
  const abortControllerRef = useRef(null);

  // Fetch products based on current search parameters
  const fetchProducts = useCallback(async (params, signal) => {
    setLoading(true);

    try {
      const apiParams = { ...params };
      apiParams.limit = 12;
      apiParams.page = apiParams.page || 1;

      const res = await getProducts(apiParams, { signal });
      const data = res.data;

      if (signal.aborted) return;

      // Backend now filters images, so we can use products directly
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        // Ignored cancellation
        return;
      }
      console.error('Failed to fetch products:', error);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Effect to fetch products whenever search parameters change
  useEffect(() => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new controller for the new request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const params = Object.fromEntries(searchParams.entries());
    fetchProducts(params, controller.signal);

    return () => {
      controller.abort();
    };
  }, [searchParams, fetchProducts]);

  // Handle URL updates when filters change
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    // Reset to page 1 for any change other than pagination
    if (key !== 'page') {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  // Debouncing search to avoid firing requests on every keystroke
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentUrlSearch = searchParams.get('search') || '';
      if (searchTerm !== currentUrlSearch) {
        updateFilter('search', searchTerm);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Keep local search term in sync with browser navigation (back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="main-content">
      <div className="container section">
        <div className="page-header">
          <h1 className="page-title">Shop All Products</h1>
          <p className="page-subtitle">
            Discover our curated collection with smart filters
          </p>
        </div>

        {/* Filters */}

        <div className="filters-panel">
          <div className="filters-row">

            <div className="search-bar">
              <FiSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label>Category</label>

              <select
                className="form-select"
                value={searchParams.get('category') || ''}
                onChange={(e) =>
                  updateFilter('category', e.target.value)
                }
              >
                <option value="">All Categories</option>

                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>

              <select
                className="form-select"
                value={searchParams.get('sort') || 'newest'}
                onChange={(e) =>
                  updateFilter('sort', e.target.value)
                }
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* price filters */}

          <div
            className="filters-row"
            style={{ marginTop: '12px' }}
          >
            <div className="filter-group">
              <label>Min Price</label>

              <input
                className="form-input"
                type="number"
                placeholder="₹0"
                value={searchParams.get('priceMin') || ''}
                onChange={(e) =>
                  updateFilter('priceMin', e.target.value)
                }
              />
            </div>

            <div className="filter-group">
              <label>Max Price</label>

              <input
                className="form-input"
                type="number"
                placeholder="₹10000"
                value={searchParams.get('priceMax') || ''}
                onChange={(e) =>
                  updateFilter('priceMax', e.target.value)
                }
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
              <label style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={searchParams.get('clearance') === 'true'}
                  onChange={(e) =>
                    updateFilter(
                      'clearance',
                      e.target.checked ? 'true' : ''
                    )
                  }
                />
                Clearance
              </label>

              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
              >
                <FiFilter /> Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results */}

        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>

            <button
              className="btn btn-primary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                {(() => {
                  const currentPage = parseInt(searchParams.get('page')) || 1;
                  return (
                    <>
                      <button
                        disabled={currentPage === 1}
                        onClick={() =>
                          updateFilter('page', currentPage - 1)
                        }
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: pagination.pages },
                        (_, i) => (
                          <button
                            key={i + 1}
                            className={
                              currentPage === i + 1 ? 'active' : ''
                            }
                            onClick={() =>
                              updateFilter('page', i + 1)
                            }
                          >
                            {i + 1}
                          </button>
                        )
                      )}

                      <button
                        disabled={currentPage === pagination.pages}
                        onClick={() =>
                          updateFilter('page', currentPage + 1)
                        }
                      >
                        Next
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;