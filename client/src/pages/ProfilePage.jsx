import React, { useState } from 'react';
import { User, MapPin, Sliders, Shield, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Addresses
  const [addresses, setAddresses] = useState(user?.shippingAddresses || []);
  const [newAddr, setNewAddr] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  // Saved Preferences
  const [preferences, setPreferences] = useState(
    user?.savedPreferences || {
      category: 'laptops',
      budgetMin: 5000,
      budgetMax: 200000,
      useCase: 'Programming & Development',
      brands: ['Apple', 'Dell'],
      priorities: {
        performance: 4,
        battery: 4,
        camera: 2,
        display: 4,
        portability: 3,
        storage: 4,
        price: 3,
        reliability: 4,
      },
    }
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await updateProfile({
        name,
        avatar,
        shippingAddresses: addresses,
        savedPreferences: preferences,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddr.street || !newAddr.city || !newAddr.state || !newAddr.postalCode || !newAddr.phone) {
      setError('Please fill in all address fields');
      return;
    }
    setAddresses([...addresses, { ...newAddr, isDefault: addresses.length === 0 }]);
    setNewAddr({ street: '', city: '', state: '', postalCode: '', phone: '' });
  };

  const handleDeleteAddress = (idx) => {
    setAddresses(addresses.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" />
          User Profile & Hardware Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account information, saved delivery addresses, and default recommendation priorities
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes and preferences saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            Account Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Avatar Image URL (Optional)</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Saved Shipping Addresses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-600" />
            Saved Shipping Destinations
          </h2>

          {/* List of existing addresses */}
          <div className="space-y-3">
            {addresses.map((addr, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">{addr.street}</p>
                  <p className="text-slate-500">
                    {addr.city}, {addr.state} {addr.postalCode} · {addr.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new address inline */}
          <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/60 space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">Add New Delivery Address</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Street address"
                value={newAddr.street}
                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                className="px-3 py-1.5 rounded-lg border bg-white"
              />
              <input
                type="text"
                placeholder="City"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="px-3 py-1.5 rounded-lg border bg-white"
              />
              <input
                type="text"
                placeholder="State / Province"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="px-3 py-1.5 rounded-lg border bg-white"
              />
              <input
                type="text"
                placeholder="Postal code"
                value={newAddr.postalCode}
                onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                className="px-3 py-1.5 rounded-lg border bg-white"
              />
              <input
                type="text"
                placeholder="Phone number"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="px-3 py-1.5 rounded-lg border bg-white sm:col-span-2"
              />
            </div>
            <button
              type="button"
              onClick={handleAddAddress}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 font-bold rounded-lg text-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>
        </div>

        {/* Saved Hardware Priorities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            Default SmartFinder Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Category</label>
              <select
                value={preferences.category || 'laptops'}
                onChange={(e) => setPreferences({ ...preferences, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Max Budget (₹)</label>
              <input
                type="number"
                min={0}
                max={500000}
                step={5000}
                value={preferences.budgetMax || 200000}
                onChange={(e) => setPreferences({ ...preferences, budgetMax: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-slate-900 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
