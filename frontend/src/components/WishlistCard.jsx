import React from 'react';
import { ArrowUpRight, HeartOff, LoaderCircle, Plus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProductImage, handleProductImageError } from '../utils/productImage';

const WishlistCard = ({ product, onRemove, onAddToCart, isRemoving, isAdding, isInCart }) => {
  const { _id, name, price, category, stock } = product;

  return (
    <article className="sk-product-card h-full flex flex-col">
      <Link to={`/products/${_id}`} className="relative h-56 overflow-hidden bg-[#edeae3] block">
        <img
          src={getProductImage(product)}
          alt={name}
          loading="lazy"
          onError={(event) => handleProductImageError(event, product)}
          className="sk-product-image w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 rounded-full bg-white/85 border border-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 backdrop-blur">
          {category}
        </span>
        <span className={`absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[10px] font-bold ${stock > 0 ? 'bg-slate-950/75 text-white' : 'bg-red-600 text-white'}`}>
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </span>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <Link to={`/products/${_id}`} className="inline-flex items-start gap-1.5 group">
            <h3 className="text-lg font-black tracking-[-0.02em] text-slate-900 group-hover:text-blue-700 transition">{name}</h3>
            <ArrowUpRight size={15} className="mt-1 text-slate-300 group-hover:text-blue-600" />
          </Link>
          <p className="mt-2 text-xl font-black text-blue-700">₹{Number(price).toLocaleString('en-IN')}</p>
        </div>

        <button
          type="button"
          onClick={() => onAddToCart(_id)}
          disabled={isAdding || stock <= 0}
          className="sk-btn-primary mt-5 !w-full !py-2.5"
        >
          {isAdding ? (
            <><LoaderCircle size={16} className="animate-spin" /> Adding...</>
          ) : stock <= 0 ? (
            'Currently unavailable'
          ) : isInCart ? (
            <><Plus size={16} /> Add another</>
          ) : (
            <><ShoppingCart size={16} /> Add to cart</>
          )}
        </button>

        <button
          type="button"
          onClick={() => onRemove(_id)}
          disabled={isRemoving}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition"
        >
          {isRemoving ? <LoaderCircle size={15} className="animate-spin" /> : <HeartOff size={15} />}
          {isRemoving ? 'Removing...' : 'Remove from wishlist'}
        </button>
      </div>
    </article>
  );
};

export default WishlistCard;
