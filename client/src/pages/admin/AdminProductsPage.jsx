import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency, formatCategoryName } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import { CATEGORIES } from '../../utils/constants';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const initialForm = {
    name: '',
    brand: '',
    category: 'laptops',
    subcategory: '',
    description: '',
    price: '',
    originalPrice: undefined,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
    warranty: '1 Year Manufacturer Warranty',
    specs: {
      processor: 'Intel Core i7',
      ram: 16,
      storage: 512,
      displaySize: 15.6,
      refreshRate: 120,
      batteryLife: 10,
      os: 'Windows 11',
    },
  };

  const [form, setForm] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/products?limit=50&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProductId(p._id);
    setForm({
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || 'laptops',
      subcategory: p.subcategory || '',
      description: p.description || '',
      price: p.price || 0,
      originalPrice: undefined,
      stock: p.stock || 0,
      images: p.images || [],
      warranty: p.warranty || '',
      specs: p.specs || {},
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      setError(null);

      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: undefined,
        stock: Number(form.stock),
      };

      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        {/* Product Inventory Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Product Name & Category</th>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Catalog Price</th>
                  <th className="p-4">Stock Units</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.images?.[0]} alt="" className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border" />
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                        <span className="text-[11px] text-slate-400">{formatCategoryName(p.category)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{p.brand}</td>
                    <td className="p-4 font-black text-slate-900">{formatCurrency(p.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold ${
                        p.stock <= 5 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {editingProductId ? 'Edit Product & Specs' : 'Create New Electronics SKU'}
                </h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Catalog Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0.01}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Stock Units</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    required
                    value={form.images[0] || ''}
                    onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                </div>

                {/* Specs input */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border">
                  <span className="font-bold text-slate-800 block">Core Specs</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 block mb-0.5">RAM (GB)</span>
                      <input
                        type="number"
                        value={form.specs?.ram || ''}
                        onChange={(e) => setForm({ ...form, specs: { ...form.specs, ram: Number(e.target.value) } })}
                        className="w-full px-2 py-1 rounded border bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Storage (GB)</span>
                      <input
                        type="number"
                        value={form.specs?.storage || ''}
                        onChange={(e) => setForm({ ...form, specs: { ...form.specs, storage: Number(e.target.value) } })}
                        className="w-full px-2 py-1 rounded border bg-white"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Refresh (Hz)</span>
                      <input
                        type="number"
                        value={form.specs?.refreshRate || ''}
                        onChange={(e) => setForm({ ...form, specs: { ...form.specs, refreshRate: Number(e.target.value) } })}
                        className="w-full px-2 py-1 rounded border bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 bg-slate-900 hover:bg-sky-600 text-white rounded-xl font-bold"
                  >
                    {formSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
