import React, { useCallback, useEffect, useState } from 'react';
import { ArrowDown, RotateCw, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSort, setSelectedSort] = useState('');

  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({
        search: searchTerm,
        category: selectedCategory,
        sort: selectedSort,
      });
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedSort]);

  useEffect(() => {
    const timer = setTimeout(fetchProductsList, 250);
    return () => clearTimeout(timer);
  }, [fetchProductsList]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSort('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <section className="relative min-h-[390px] sm:min-h-[430px] overflow-hidden rounded-[2rem] bg-[#eee7dc] shadow-[0_24px_70px_rgba(15,23,42,0.12)] sk-rise">
        <img
          src="/images/shopkart-hero.jpg"
          alt="Curated ShopKart products including headphones, keyboard, watch, book, lamp and sneaker"
          className="absolute inset-0 w-full h-full object-cover object-[64%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf7ef] via-[#fbf7ef]/95 to-[#fbf7ef]/0" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/10 to-transparent sm:hidden" />

        <div className="relative z-10 max-w-xl p-7 sm:p-12 lg:p-14">
          <span className="sk-section-label">New season · new energy</span>
          <h1 className="mt-5 text-[2.65rem] sm:text-6xl font-black leading-[0.94] tracking-[-0.055em] text-slate-950">
            Everyday goods,
            <span className="block text-[#1746d2]">chosen better.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm sm:text-base leading-7 text-slate-600">
            Smart tech, thoughtful home pieces, good reads, and effortless style—all curated in one refreshingly simple shop.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#collection" className="sk-btn-primary">
              Explore the edit <ArrowDown size={17} />
            </a>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/75 px-4 py-3 text-xs font-bold text-slate-700 backdrop-blur-sm border border-white">
              <Sparkles size={15} className="text-[#ff7657]" /> {products.length || '12'} curated picks
            </span>
          </div>
        </div>

        <div className="absolute right-5 bottom-5 hidden lg:flex items-center gap-2 rounded-2xl bg-white/85 backdrop-blur-md border border-white p-2 shadow-lg sk-float">
          <span className="w-10 h-10 rounded-xl bg-[#d9f99d] flex items-center justify-center text-slate-900"><ShieldCheck size={20} /></span>
          <span className="pr-3"><strong className="block text-xs text-slate-900">Shop with confidence</strong><small className="text-[10px] text-slate-500">Secure test checkout</small></span>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          [Truck, 'Easy browsing', 'Find the right pick without the noise'],
          [ShieldCheck, 'Secure checkout', 'Server-verified payments and orders'],
          [Sparkles, 'Curated collection', 'Useful things with a point of view'],
        ].map(([Icon, title, copy]) => (
          <div key={title} className="sk-card !rounded-xl !shadow-sm px-4 py-3 flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0"><Icon size={17} /></span>
            <span><strong className="block text-xs text-slate-900">{title}</strong><small className="text-[11px] text-slate-500">{copy}</small></span>
          </div>
        ))}
      </div>

      <section id="collection" className="scroll-mt-32 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="sk-section-label">The ShopKart edit</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-[-0.04em] text-slate-950">Find your next favorite</h2>
          </div>
          {!loading && !error && (
            <p className="text-sm text-slate-500"><strong className="text-slate-900">{products.length}</strong> product{products.length === 1 ? '' : 's'} waiting</p>
          )}
        </div>

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sort={selectedSort}
          onSortChange={setSelectedSort}
          onReset={handleResetFilters}
        />

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="h-[410px] rounded-[1.4rem] bg-white border border-white shadow-sm animate-pulse overflow-hidden">
                <div className="h-56 bg-slate-200" /><div className="p-5 space-y-3"><div className="h-4 w-2/3 bg-slate-200 rounded" /><div className="h-3 w-full bg-slate-100 rounded" /><div className="h-10 mt-6 bg-slate-100 rounded-xl" /></div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="sk-card p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4"><RotateCw size={23} /></div>
            <h3 className="font-bold text-slate-900">The collection took a wrong turn</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">{error}</p>
            <button onClick={fetchProductsList} className="sk-btn-primary !py-2.5">Try again</button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="sk-card p-12 text-center">
            <p className="text-5xl mb-4">◌</p>
            <h3 className="text-xl font-bold text-slate-900">Nothing matched that search</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">Try another phrase or reset the filters.</p>
            <button onClick={handleResetFilters} className="sk-btn-secondary !py-2.5">Reset filters</button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product, index) => (
              <div key={product._id} className="sk-rise" style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Products;
