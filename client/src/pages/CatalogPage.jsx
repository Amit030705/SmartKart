import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { CATEGORIES } from '../utils/constants';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const brandParam = searchParams.get('brand') || '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [priceRange, setPriceRange] = useState({
    min: minPriceParam || 0,
    max: maxPriceParam || 4000,
  });

  // Unique brands available across catalog
  const popularBrands = ['Apple', 'Samsung', 'Dell', 'Lenovo', 'Sony', 'Bose', 'ASUS', 'LG', 'Garmin', 'Google'];

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (categoryParam) query.set('category', categoryParam);
      if (searchParam) query.set('search', searchParam);
      if (sortParam) query.set('sort', sortParam);
      if (pageParam) query.set('page', pageParam);
      if (minPriceParam) query.set('minPrice', minPriceParam);
      if (maxPriceParam) query.set('maxPrice', maxPriceParam);
      if (inStockParam) query.set('inStock', 'true');
      if (brandParam) query.set('brand', brandParam);

      const { data } = await api.get(`/products?${query.toString()}`);
      if (data.success) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [categoryParam, searchParam, sortParam, pageParam, minPriceParam, maxPriceParam, inStockParam, brandParam]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter modification
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchInput('');
    setPriceRange({ min: 0, max: 4000 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Electronics Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {total} {total === 1 ? 'product' : 'products'} matching your criteria
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Sort By:</span>
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                Filters
              </span>
              {(categoryParam || searchParam || minPriceParam || maxPriceParam || brandParam || inStockParam) && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* In-Catalog Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </form>

            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Category</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !categoryParam ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Categories
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateParam('category', cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryParam === cat.id ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brand</p>
              <div className="flex flex-wrap gap-1.5">
                {popularBrands.map((b) => {
                  const isSelected = brandParam.toLowerCase() === b.toLowerCase();
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateParam('brand', isSelected ? '' : b)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Budget Ceiling</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400">Min ₹</span>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-2 py-1 text-xs border rounded-lg bg-slate-50"
                  />
                </div>
                <span className="text-slate-400 mt-3">-</span>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400">Max ₹</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-2 py-1 text-xs border rounded-lg bg-slate-50"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  if (priceRange.min) next.set('minPrice', priceRange.min);
                  else next.delete('minPrice');
                  if (priceRange.max) next.set('maxPrice', priceRange.max);
                  else next.delete('maxPrice');
                  next.set('page', '1');
                  setSearchParams(next);
                }}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
              >
                Apply Price
              </button>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockParam}
                  onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                In Stock Only
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Chips */}
          {(categoryParam || searchParam || brandParam || minPriceParam || maxPriceParam) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Active filters:</span>
              {categoryParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200">
                  Category: {categoryParam}
                  <button onClick={() => updateParam('category', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200">
                  Search: "{searchParam}"
                  <button onClick={() => updateParam('search', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {brandParam && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200">
                  Brand: {brandParam}
                  <button onClick={() => updateParam('brand', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPriceParam || maxPriceParam) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-sky-50 text-sky-700 border border-sky-200">
                  Price: ₹{minPriceParam || 0} - ₹{maxPriceParam || 'Max'}
                  <button onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('minPrice');
                    next.delete('maxPrice');
                    setSearchParams(next);
                  }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Loading or Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No electronics found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No products in our current catalog matched all of your filter parameters. Try clearing some filters or searching for broader terms.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={pageParam <= 1}
                onClick={() => updateParam('page', pageParam - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', p)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                    pageParam === p
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={pageParam >= pages}
                onClick={() => updateParam('page', pageParam + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
