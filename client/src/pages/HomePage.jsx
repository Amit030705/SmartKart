import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Laptop, Monitor, Smartphone, Tablet, Watch } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { CATEGORIES } from '../utils/constants';

const categoryIcons = {
  smartphones: Smartphone,
  laptops: Laptop,
  headphones: Headphones,
  smartwatches: Watch,
  monitors: Monitor,
  tablets: Tablet,
};

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/featured')
      .then(({ data }) => setProducts(data.featured || []))
      .catch((error) => console.error('Could not load products', error))
      .finally(() => setLoading(false));

    try {
      const saved = JSON.parse(localStorage.getItem('smartcart_recently_viewed') || '[]');
      setRecentlyViewed(Array.isArray(saved) ? saved : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, []);

  const leadProduct = products[0];

  return (
    <div className="pb-16">
      <section className="bg-[#f1efe8] border-b border-[#e4e1d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-[#52705d] mb-4">A better way to shop for electronics</p>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-[#202722]">
              Find the right tech for your everyday.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#5f665f]">
              Browse phones, laptops and more. Compare the details that matter, then choose what fits your budget.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/catalog" className="inline-flex items-center gap-2 rounded-md bg-[#315740] px-5 py-3 text-sm font-medium text-white hover:bg-[#264633] transition-colors">
                Browse products <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/smart-finder" className="inline-flex items-center rounded-md border border-[#c9cec7] bg-white/70 px-5 py-3 text-sm font-medium text-[#303a32] hover:bg-white transition-colors">
                Get a recommendation
              </Link>
            </div>
          </div>

          {leadProduct && (
            <Link to={`/product/${leadProduct.slug || leadProduct._id}`} className="group grid grid-cols-2 items-center gap-4 rounded-lg border border-[#e3e0d7] bg-white p-5 sm:p-7">
              <div className="flex aspect-square items-center justify-center bg-[#f7f7f4] p-4">
                <img src={leadProduct.images?.[0]} alt={leadProduct.name} className="max-h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#718075]">A look at the catalog</p>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-[#202722] group-hover:text-[#315740]">{leadProduct.name}</h2>
                <p className="mt-3 text-lg font-semibold text-[#202722]">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(leadProduct.price)}
                </p>
                <p className="mt-1 text-xs text-[#747b74]">Catalog price</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#315740]">See product <ArrowRight className="w-4 h-4" /></span>
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#202722]">Shop by category</h2>
            <p className="mt-1 text-sm text-[#6b716b]">Start with the kind of device you need.</p>
          </div>
          <Link to="/catalog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#315740] hover:underline">All products <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-l border-t border-[#e3e5df]">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category.id] || Smartphone;
            return (
              <Link key={category.id} to={`/catalog?category=${category.id}`} className="flex items-center gap-3 border-r border-b border-[#e3e5df] bg-white p-4 text-sm font-medium text-[#303a32] hover:bg-[#f7f8f5] transition-colors">
                <Icon className="h-5 w-5 shrink-0 text-[#52705d]" />
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#202722]">From the catalog</h2>
            <p className="mt-1 text-sm text-[#6b716b]">Product details and catalog prices in one place.</p>
          </div>
          <Link to="/catalog" className="inline-flex items-center gap-1 text-sm font-medium text-[#315740] hover:underline">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse bg-[#f0f1ed]" />)}</div>
        ) : products.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{products.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)}</div>
        ) : (
          <p className="border border-[#e3e5df] bg-white p-6 text-sm text-[#6b716b]">There are no products to show yet.</p>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-5 border-y border-[#e3e5df] py-7 sm:grid-cols-3">
          <div><p className="text-sm font-semibold text-[#202722]">1. Set your priorities</p><p className="mt-1 text-sm text-[#6b716b]">Choose a category, budget and the features you care about.</p></div>
          <div><p className="text-sm font-semibold text-[#202722]">2. Compare your options</p><p className="mt-1 text-sm text-[#6b716b]">Review specifications and prices side by side.</p></div>
          <div><p className="text-sm font-semibold text-[#202722]">3. Make your choice</p><p className="mt-1 text-sm text-[#6b716b]">Save products or add one to your cart when you’re ready.</p></div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="mb-5 text-2xl font-semibold text-[#202722]">Recently viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{recentlyViewed.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)}</div>
        </section>
      )}
    </div>
  );
}
