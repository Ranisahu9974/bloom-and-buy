import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { FiSearch, FiFilter } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Automotive', 'Other'];
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
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || 'newest',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        clearance: searchParams.get('clearance') || '',
        page: parseInt(searchParams.get('page')) || 1
    });

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.search) params.search = filters.search;
            if (filters.category) params.category = filters.category;
            if (filters.sort) params.sort = filters.sort;
            if (filters.priceMin) params.priceMin = filters.priceMin;
            if (filters.priceMax) params.priceMax = filters.priceMax;
            if (filters.clearance) params.clearance = filters.clearance;
            params.page = filters.page;
            params.limit = 12;

            const { data } = await productsAPI.getAll(params);
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        // If sorting or filtering, reset to page 1. If paginating, keep the new page.
        if (key !== 'page') {
            newFilters.page = 1;
        }

        setFilters(newFilters);

        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        const cleared = { search: '', category: '', sort: 'newest', priceMin: '', priceMax: '', clearance: '', page: 1 };
        setFilters(cleared);
        setSearchParams({});
    };

    return (
        <div className="main-content">
            <div className="container section">
                <div className="page-header">
                    <h1 className="page-title">Shop All Products</h1>
                    <p className="page-subtitle">Discover our curated collection with smart filters</p>
                </div>

                {/* Filters */}
                <div className="filters-panel">
                    <div className="filters-row">
                        <div className="search-bar">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search products, brands, categories..."
                                value={filters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                className="form-select"
                                value={filters.category}
                                onChange={(e) => updateFilter('category', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By</label>
                            <select
                                className="form-select"
                                value={filters.sort}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                            >
                                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="filters-row" style={{ marginTop: '12px' }}>
                        <div className="filter-group" style={{ minWidth: '120px', flex: '0' }}>
                            <label>Min Price</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="₹0"
                                value={filters.priceMin}
                                onChange={(e) => updateFilter('priceMin', e.target.value)}
                            />
                        </div>

                        <div className="filter-group" style={{ minWidth: '120px', flex: '0' }}>
                            <label>Max Price</label>
                            <input
                                className="form-input"
                                type="number"
                                placeholder="₹82,917"
                                value={filters.priceMax}
                                onChange={(e) => updateFilter('priceMax', e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 16px', background: filters.clearance ? 'rgba(239,68,68,0.15)' : 'var(--bg-input)', border: `1px solid ${filters.clearance ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: filters.clearance ? 'var(--error)' : 'var(--text-secondary)' }}>
                                <input
                                    type="checkbox"
                                    checked={filters.clearance === 'true'}
                                    onChange={(e) => updateFilter('clearance', e.target.checked ? 'true' : '')}
                                    style={{ accentColor: 'var(--error)' }}
                                />
                                Clearance Only
                            </label>

                            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                                <FiFilter /> Clear All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {pagination.total || 0} products found
                    </span>
                </div>

                {loading ? (
                    <div className="products-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search terms</p>
                        <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
                    </div>
                ) : (
                    <>
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    disabled={filters.page === 1}
                                    onClick={() => updateFilter('page', filters.page - 1)}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: pagination.pages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        className={filters.page === i + 1 ? 'active' : ''}
                                        onClick={() => updateFilter('page', i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    disabled={filters.page === pagination.pages}
                                    onClick={() => updateFilter('page', filters.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;
