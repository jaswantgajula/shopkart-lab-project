import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

const SearchBar = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  onReset,
}) => {
  const hasFilters = Boolean(searchTerm || category || sort);

  return (
    <div className="sk-card !rounded-[1.35rem] p-3 sm:p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <label htmlFor="search-input" className="sr-only">Search products</label>
          <input
            id="search-input"
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by product name or idea..."
            className="sk-field !pl-11 !pr-10 !border-transparent !bg-slate-50 focus:!bg-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="hidden sm:block text-slate-400" />
          <label htmlFor="sort-select" className="sr-only">Sort products</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="sk-field !w-auto min-w-48 !py-2.5 !bg-slate-50 !border-transparent font-semibold"
          >
            <option value="">Featured first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          {hasFilters && (
            <button type="button" onClick={onReset} className="h-11 px-3 rounded-xl text-xs font-bold text-coral-700 bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap">
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto sk-no-scrollbar pb-0.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-1 shrink-0">Browse</span>
        {CATEGORIES.map((item) => {
          const value = item === 'All' ? '' : item;
          const selected = category === value;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onCategoryChange(value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                selected
                  ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
