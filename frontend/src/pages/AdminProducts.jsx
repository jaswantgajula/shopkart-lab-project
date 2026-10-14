import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Image as ImageIcon,
  LoaderCircle,
  PackageCheck,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  addProductStock,
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/api';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  image: '',
  stock: '',
};

const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(price) || 0);

const getErrorMessage = (error, fallback) => (
  error.response?.data?.error || error.response?.data?.message || fallback
);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState('');
  const [restockAmounts, setRestockAmounts] = useState({});

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data.products || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load the inventory.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const inventory = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => (
      product.name.toLowerCase().includes(term)
      || product.category.toLowerCase().includes(term)
    ));
  }, [products, search]);

  const stats = useMemo(() => ({
    total: products.length,
    low: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
    out: products.filter((product) => product.stock === 0).length,
  }), [products]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const clearForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const startEditing = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      stock: String(product.stock),
    });
    setError('');
    setNotice('');
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      image: form.image.trim(),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        const data = await updateProduct(editingId, payload);
        setProducts((current) => current.map((product) => (
          product._id === editingId ? data.product : product
        )));
        setNotice(`${data.product.name} was updated.`);
      } else {
        const data = await createProduct(payload);
        setProducts((current) => [data.product, ...current]);
        setNotice(`${data.product.name} was added to the store.`);
      }
      clearForm();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not save this product.'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async (product) => {
    const amount = Number(restockAmounts[product._id]);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Enter a positive whole number before adding stock.');
      return;
    }

    setActionId(product._id);
    setError('');
    setNotice('');
    try {
      const data = await addProductStock(product._id, amount);
      setProducts((current) => current.map((item) => (
        item._id === product._id ? data.product : item
      )));
      setRestockAmounts((current) => ({ ...current, [product._id]: '' }));
      setNotice(`${amount} unit${amount === 1 ? '' : 's'} added to ${product.name}.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not update the stock.'));
    } finally {
      setActionId('');
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete “${product.name}”? This removes it from the catalog.`);
    if (!confirmed) return;

    setActionId(product._id);
    setError('');
    setNotice('');
    try {
      await deleteProduct(product._id);
      setProducts((current) => current.filter((item) => item._id !== product._id));
      if (editingId === product._id) clearForm();
      setNotice(`${product.name} was deleted.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not delete this product.'));
    } finally {
      setActionId('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#102b80] p-7 sm:p-10 text-white shadow-[0_24px_70px_rgba(15,43,128,0.22)] sk-rise">
        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full border-[44px] border-white/[0.06]" />
        <div className="absolute right-24 -bottom-28 h-56 w-56 rounded-full bg-[#ff7657]/20 blur-2xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-7">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
              <ShieldCheck size={14} /> Administrator workspace
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-black tracking-[-0.05em]">Inventory control room</h1>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-7 text-blue-100">
              Add new products, refresh details, and keep every shelf stocked from one focused dashboard.
            </p>
          </div>
          <button onClick={loadProducts} disabled={loading} className="self-start lg:self-auto inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur transition hover:bg-white/20 disabled:opacity-60">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh inventory
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          [PackageCheck, 'Catalog products', stats.total, 'bg-blue-50 text-blue-700'],
          [AlertTriangle, 'Low stock', stats.low, 'bg-amber-50 text-amber-700'],
          [Boxes, 'Out of stock', stats.out, 'bg-rose-50 text-rose-700'],
        ].map(([Icon, label, value, color]) => (
          <div key={label} className="sk-card p-4 flex items-center gap-4">
            <span className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color}`}><Icon size={21} /></span>
            <span><strong className="block text-2xl leading-none text-slate-950">{value}</strong><small className="mt-1.5 block text-xs font-semibold text-slate-500">{label}</small></span>
          </div>
        ))}
      </section>

      {(error || notice) && (
        <div className={`rounded-2xl border px-5 py-4 text-sm font-semibold flex items-start justify-between gap-3 ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          <span>{error || notice}</span>
          <button onClick={() => { setError(''); setNotice(''); }} aria-label="Dismiss message"><X size={17} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] gap-6 items-start">
        <section id="product-form" className="sk-card overflow-hidden scroll-mt-32 lg:sticky lg:top-32">
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-br from-white to-blue-50/60">
            <span className="sk-section-label">{editingId ? 'Edit mode' : 'New arrival'}</span>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
              {editingId ? 'Update product' : 'Add a product'}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Changes appear in the customer catalog immediately.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Product name</span>
              <input className="sk-field" name="name" value={form.name} onChange={handleFormChange} placeholder="Mechanical Keyboard" required />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Description</span>
              <textarea className="sk-field min-h-24 resize-y" name="description" value={form.description} onChange={handleFormChange} placeholder="What makes this product useful?" required />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Price (₹)</span>
                <input className="sk-field" type="number" name="price" min="0.01" step="0.01" value={form.price} onChange={handleFormChange} placeholder="2999" required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold text-slate-700">Opening stock</span>
                <input className="sk-field" type="number" name="stock" min="0" step="1" value={form.stock} onChange={handleFormChange} placeholder="20" required />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Category</span>
              <input className="sk-field" name="category" list="product-categories" value={form.category} onChange={handleFormChange} required />
              <datalist id="product-categories">
                <option value="Electronics" />
                <option value="Fashion" />
                <option value="Books" />
                <option value="Home" />
              </datalist>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Image URL</span>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input className="sk-field !pl-11" type="url" name="image" value={form.image} onChange={handleFormChange} placeholder="https://images.example.com/product.jpg" required />
              </div>
            </label>

            {form.image && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[16/7]">
                <img src={getProductImage(form)} onError={(event) => handleProductImageError(event, form)} alt="Product preview" className="h-full w-full object-cover" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button type="submit" disabled={saving} className="sk-btn-primary flex-1">
                {saving ? <LoaderCircle size={17} className="animate-spin" /> : editingId ? <Pencil size={17} /> : <PackagePlus size={17} />}
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add to catalog'}
              </button>
              {editingId && <button type="button" onClick={clearForm} className="sk-btn-secondary !px-4"><X size={17} /> Cancel</button>}
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="sk-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="sk-section-label">Live inventory</span>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">Manage your shelves</h2>
            </div>
            <label className="relative sm:w-64">
              <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
              <input className="sk-field !pl-11" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
            </label>
          </div>

          {loading && (
            <div className="sk-card p-12 text-center text-slate-500">
              <LoaderCircle size={28} className="animate-spin mx-auto mb-3 text-blue-600" /> Loading inventory...
            </div>
          )}

          {!loading && inventory.length === 0 && (
            <div className="sk-card p-12 text-center">
              <Boxes size={34} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-bold text-slate-900">No products found</h3>
              <p className="mt-1 text-sm text-slate-500">{search ? 'Try a different search.' : 'Use the form to add your first product.'}</p>
            </div>
          )}

          {!loading && inventory.map((product) => {
            const isBusy = actionId === product._id;
            const stockTone = product.stock === 0
              ? 'bg-rose-50 text-rose-700 border-rose-100'
              : product.stock <= 5
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-100';

            return (
              <article key={product._id} className="sk-card p-4 sm:p-5 transition hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="h-36 sm:h-28 sm:w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                    <img src={getProductImage(product)} onError={(event) => handleProductImageError(event, product)} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">{product.category}</p>
                        <h3 className="mt-1 truncate text-lg font-black text-slate-950">{product.name}</h3>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{product.description}</p>
                      </div>
                      <strong className="shrink-0 text-base text-slate-950">{formatPrice(product.price)}</strong>
                    </div>

                    <div className="mt-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                      <span className={`w-fit rounded-full border px-3 py-1 text-[11px] font-black ${stockTone}`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            aria-label={`Units to add to ${product.name}`}
                            value={restockAmounts[product._id] || ''}
                            onChange={(event) => setRestockAmounts((current) => ({ ...current, [product._id]: event.target.value }))}
                            placeholder="Qty"
                            className="w-16 bg-transparent px-2 py-1.5 text-xs font-bold outline-none"
                          />
                          <button type="button" onClick={() => handleRestock(product)} disabled={isBusy} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                            <Plus size={13} /> Stock
                          </button>
                        </div>
                        <button type="button" onClick={() => startEditing(product)} disabled={isBusy} title="Edit product" className="sk-icon-button !h-9 !w-9 !shadow-sm"><Pencil size={15} /></button>
                        <button type="button" onClick={() => handleDelete(product)} disabled={isBusy} title="Delete product" className="sk-icon-button !h-9 !w-9 !shadow-sm hover:!text-red-600">
                          {isBusy ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default AdminProducts;
