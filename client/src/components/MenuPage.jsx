import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiSliders, FiStar, FiRefreshCw, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Error fetching categories', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when filters change
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let queryStr = `/products?page=${page}&limit=12&sort=${sort}`;
      if (search) queryStr += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) queryStr += `&category=${selectedCategory}`;
      if (maxPrice) queryStr += `&maxPrice=${maxPrice}`;
      if (minRating) queryStr += `&minRating=${minRating}`;

      const res = await API.get(queryStr);
      if (res.data.success) {
        setProducts(res.data.data);
        setTotalPages(res.data.pages);
        setTotalProducts(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching menu products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sort, page, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategorySelect = (catSlug) => {
    setSelectedCategory(catSlug);
    setPage(1);
    if (catSlug) {
      setSearchParams({ category: catSlug });
    } else {
      setSearchParams({});
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMaxPrice(500);
    setMinRating('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="menu-page page-wrapper">
      <div className="container">
        {/* Page Banner Header */}
        <div className="menu-header">
          <h1>Explore Our Menu</h1>
          <p>Handcrafted drinks, oven-fresh pizzas, juicy burgers and artisanal baked desserts.</p>
        </div>

        {/* Search & Sort Bar */}
        <div className="menu-search-bar-wrapper">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search coffee, pizza, burgers, cakes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </form>

          <div className="sort-wrapper">
            <label className="sort-label">Sort By:</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="form-select sort-select"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="category-chips-wrapper">
          <button
            className={`chip-btn ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => handleCategorySelect('')}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`chip-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Layout Grid: Sidebar Filters & Product Grid */}
        <div className="menu-layout">
          {/* Left Sidebar Filter Box */}
          <aside className="filters-sidebar">
            <div className="sidebar-title-box">
              <h3><FiFilter /> Filters</h3>
              <button className="reset-btn" onClick={resetFilters}>
                <FiRefreshCw /> Reset
              </button>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <label className="form-label">Max Price: ₹{maxPrice}</label>
              <input
                type="range"
                min="50"
                max="600"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onMouseUp={() => { setPage(1); fetchProducts(); }}
                onTouchEnd={() => { setPage(1); fetchProducts(); }}
                className="price-range-slider"
              />
              <div className="range-labels">
                <span>₹50</span>
                <span>₹600</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <label className="form-label">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
                className="form-select"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5★ & above</option>
                <option value="4.0">4.0★ & above</option>
                <option value="3.5">3.5★ & above</option>
              </select>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="menu-main-content">
            {loading ? (
              <div className="spinner"></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">☕</div>
                <h3>No Products Found</h3>
                <p>We couldn't find anything matching your selected search or filter criteria.</p>
                <button className="btn btn-primary mt-4" onClick={resetFilters}>Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="results-count-bar">
                  <span>Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> items</span>
                </div>

                <div className="grid-3 menu-products-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      disabled={page === 1}
                      onClick={() => setPage(prev => prev - 1)}
                    >
                      <FiChevronLeft /> Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`page-num ${page === i + 1 ? 'active' : ''}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage(prev => prev + 1)}
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .menu-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .menu-header p {
          color: var(--text-muted);
          font-size: 1.05rem;
          max-width: 600px;
          margin: 6px auto 0 auto;
        }

        .menu-search-bar-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #ffffff;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
          margin-bottom: 24px;
        }

        .search-form {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          background: var(--bg-page);
          padding: 6px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .search-icon {
          color: var(--primary);
          font-size: 1.2rem;
        }

        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.95rem;
          outline: none;
        }

        .sort-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sort-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--primary);
          white-space: nowrap;
        }

        .sort-select {
          padding: 8px 14px;
          width: auto;
        }

        /* Chips */
        .category-chips-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 30px;
          scrollbar-width: none;
        }

        .chip-btn {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          background: #ffffff;
          border: 1px solid var(--border-light);
          color: var(--text-dark);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }

        .chip-btn:hover, .chip-btn.active {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        /* Layout */
        .menu-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 30px;
        }

        .filters-sidebar {
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          padding: 24px;
          height: fit-content;
        }

        .sidebar-title-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 20px;
        }

        .sidebar-title-box h3 {
          font-size: 1.15rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reset-btn {
          background: none;
          border: none;
          font-size: 0.8rem;
          color: var(--accent-hover);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .filter-group {
          margin-bottom: 20px;
        }

        .price-range-slider {
          width: 100%;
          accent-color: var(--primary);
          margin-top: 8px;
        }

        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .results-count-bar {
          margin-bottom: 18px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
        }

        .page-btn, .page-num {
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-num.active {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        @media (max-width: 992px) {
          .menu-layout { grid-template-columns: 1fr; }
          .menu-search-bar-wrapper { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </div>
  );
};

export default MenuPage;
