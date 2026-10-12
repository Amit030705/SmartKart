import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Address form
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  // Use saved address if user has one
  useEffect(() => {
    if (user?.shippingAddresses?.length > 0) {
      const defaultAddr = user.shippingAddresses.find((a) => a.isDefault) || user.shippingAddresses[0];
      setAddress({
        street: defaultAddr.street || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        postalCode: defaultAddr.postalCode || '',
        country: defaultAddr.country || 'India',
        phone: defaultAddr.phone || '',
      });
    }
  }, [user]);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('card_simulated');
  const [simulatedCardNumber, setSimulatedCardNumber] = useState('4242 •••• •••• 4242');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = cart.subtotal || 0;
  const shippingCost = 0;
  const tax = 0;
  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.street || !address.city || !address.state || !address.postalCode || !address.phone) {
      setError('Please fill in all required shipping address fields');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      setError('Your shopping cart is currently empty');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const itemsPayload = cart.items.map((i) => ({
        productId: i.product?._id || i.product,
        quantity: i.quantity,
      }));

      const { data } = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
        items: itemsPayload,
      });

      if (data.success && data.order) {
        clearCart();
        navigate(`/order-confirmation/${data.order.orderNumber || data.order._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Finalize Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review shipping destination, simulated payment details, and confirm purchase
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Columns: Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-sky-600" />
              1. Delivery & Shipping Address
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method (Simulated Flow) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-600" />
                2. Simulated Payment Gateway
              </h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Sandbox Mode Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'card_simulated' ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Simulated Credit Card</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card_simulated"
                      checked={paymentMethod === 'card_simulated'}
                      onChange={() => setPaymentMethod('card_simulated')}
                      className="text-sky-600"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Instant authorization</span>
                </label>

                <label className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'cod' ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20' : 'border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Cash on Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-sky-600"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">Pay upon delivery</span>
                </label>
              </div>

              {paymentMethod === 'card_simulated' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <p className="font-semibold text-slate-700">Simulated Card Information</p>
                  <p className="text-slate-500 text-[11px]">
                    Card: <span className="font-mono font-bold text-slate-800">{simulatedCardNumber}</span> · Expiry: 12/28 · CVC: 888
                  </p>
                  <p className="text-[10px] text-slate-400">
                    * No real bank charge will be made. Raw card data is never transmitted or stored.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Review Bag ({cart.itemCount} items)
            </h2>

            {/* Compact items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((i) => (
                <div key={i._id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <img src={i.product?.images?.[0]} alt="" className="w-8 h-8 object-contain rounded bg-slate-50 p-1" />
                    <span className="truncate text-slate-700">{i.product?.name} × {i.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency((i.product?.price || 0) * i.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Commercial Pricing calculation */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-slate-800">Included</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-bold text-slate-800">No tax configured</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-extrabold text-slate-900">
                <span>Order Total</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-sky-600 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Verifying Stock & Processing...' : `Confirm & Place Order (${formatCurrency(total)})`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
