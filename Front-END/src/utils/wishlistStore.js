export const WISHLIST_KEY = 'nari-craft:wishlist:v1';
const EVENT = 'nari-craft:wishlist-changed';

export function parseWishlist(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter(id => typeof id === 'string' && id.trim()))] : [];
  } catch { return []; }
}

export function wishlistSnapshot() {
  try { return window.localStorage.getItem(WISHLIST_KEY) || '[]'; }
  catch { return '[]'; }
}

export function subscribeWishlist(callback) {
  const onStorage = event => { if (!event.key || event.key === WISHLIST_KEY) callback(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT, callback);
  };
}

export function toggleWishlist(productId) {
  if (typeof productId !== 'string' || !productId.trim()) throw new Error('This product cannot be saved');
  const ids = parseWishlist(wishlistSnapshot());
  const saved = !ids.includes(productId);
  const updated = saved ? [...ids, productId] : ids.filter(id => id !== productId);
  // Let callers show an error if the browser refuses persistent storage.
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT));
  return saved;
}
