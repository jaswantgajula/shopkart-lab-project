const PRODUCT_IMAGES = {
  'mechanical keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=88',
  'smart watch pro': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=88',
  'ultra hd 4k monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&auto=format&fit=crop&q=88',
  'wireless gaming mouse': 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&auto=format&fit=crop&q=88',
  'classic denim jacket': 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=1200&auto=format&fit=crop&q=88',
  'running sneakers pro': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=88',
  'casual cotton t-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&auto=format&fit=crop&q=88',
  'clean code handbook': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=88',
  'the pragmatic programmer': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&auto=format&fit=crop&q=88',
  'ergonomic desk chair': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=88',
  'smart led desk lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=88',
  'noise cancelling headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=88',
};

const CATEGORY_IMAGES = {
  electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&auto=format&fit=crop&q=88',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=88',
  books: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200&auto=format&fit=crop&q=88',
  home: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&auto=format&fit=crop&q=88',
};

const DEFAULT_IMAGE = '/images/shopkart-hero.jpg';

export const getFallbackProductImage = (product = {}) => {
  const name = String(product.name || '').trim().toLowerCase();
  const category = String(product.category || '').trim().toLowerCase();
  return PRODUCT_IMAGES[name] || CATEGORY_IMAGES[category] || DEFAULT_IMAGE;
};

export const getProductImage = (product = {}) => (
  String(product.image || '').trim() || getFallbackProductImage(product)
);

export const handleProductImageError = (event, product = {}) => {
  const fallback = getFallbackProductImage(product);
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
};
