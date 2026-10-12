import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  ArrowLeftRight,
  User,
  Sparkles,
  Menu,
  X,
  LogOut,
  Package,
  Shield,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { CATEGORIES } from '../../utils/constants';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { comparedProducts } = useCompare();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                Smart<span className="text-sky-600">Cart</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
                Electronics
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specs, brands, OLED, 32GB RAM..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm rounded-full border border-transparent focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </form>

          {/* Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Smart Finder CTA */}
            <Link
              to="/smart-finder"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
              Smart Finder
            </Link>

            {/* Compare */}
            <Link
              to="/compare"
              className="relative p-2.5 rounded-full text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors"
              title="Compare Products"
            >
              <ArrowLeftRight className="w-5 h-5" />
              {comparedProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-sky-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {comparedProducts.length}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist?.products?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {wishlist.products.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cart.itemCount}
                </span>
              )}
            </Link>

            {/* Account / Auth dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[90px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                            Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        My Profile & Preferences
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-sky-600"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        Order History
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 rounded-xl transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex text-xs font-semibold bg-slate-900 text-white hover:bg-sky-600 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Bar */}
        <div className="hidden md:flex items-center justify-between py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-6 overflow-x-auto">
            <Link to="/catalog" className="hover:text-sky-600 transition-colors font-semibold text-slate-900">
              All Electronics
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                className="hover:text-sky-600 transition-colors whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Shipping included in displayed catalog price</span>
            <span>·</span>
            <span>1-Year Standard Warranties</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4 animate-fadeIn">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 text-xs rounded-xl"
            />
          </form>

          <Link
            to="/smart-finder"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            Find My Perfect Product (Smart Finder)
          </Link>

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Browse Categories
            </p>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-50"
            >
              All Electronics
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-50 text-slate-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
