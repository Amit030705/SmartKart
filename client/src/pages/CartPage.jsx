import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const subtotal = cart.subtotal || 0;
  const shippingCost = 0;
  const tax = 0;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Shopping Cart is Empty</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't added any electronics to your cart yet. Browse our curated catalog or use the Smart Finder to find products matching your exact preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalog"
            className="px-6 py-3 bg-slate-900 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition-colors shadow-sm"
          >
            Explore Catalog
          </Link>
          <Link
            to="/smart-finder"
            className="px-6 py-3 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-2xl text-xs font-bold transition-colors"
          >
            Launch Smart Finder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your active bag
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Empty Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Items */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
            {cart.items.map((item) => {
              const p = item.product;
              if (!p) return null;

              return (
                <div key={item._id} className="p-5 flex flex-wrap sm:flex-nowrap items-center gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${p.slug || p._id}`}
                    className="w-20 h-20 bg-slate-50 rounded-2xl p-2 shrink-0 border border-slate-100 flex items-center justify-center"
                  >
                    <img src={p.images?.[0]} alt="" className="w-full h-full object-contain" />
                  </Link>

                  {/* Title & Brand */}
                  <div className="flex-1 min-w-[200px]">
                    <span className="text-[10px] uppercase font-bold text-sky-600">{p.brand}</span>
                    <Link
                      to={`/product/${p.slug || p._id}`}
                      className="block font-bold text-sm text-slate-800 hover:text-sky-600 transition-colors line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Unit Price: {formatCurrency(p.price)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => updateCartItem(item._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={p.stock <= item.quantity}
                      onClick={() => updateCartItem(item._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatCurrency(p.price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-bold text-slate-800">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span className="font-bold text-slate-800">No tax configured</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900">Total</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-slate-900 hover:bg-sky-600 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              Proceed to Secure Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isAuthenticated && (
              <p className="text-[11px] text-slate-400 text-center">
                You will be prompted to log in or register before confirming your order.
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Simulated PCI-DSS Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-600" />
                <span>30-Day Complete Satisfaction Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
