import { useMemo, useSyncExternalStore } from 'react';
import { parseWishlist, subscribeWishlist, wishlistSnapshot } from './wishlistStore.js';

export function useWishlist() {
  const snapshot = useSyncExternalStore(subscribeWishlist, wishlistSnapshot, () => '[]');
  return useMemo(() => parseWishlist(snapshot), [snapshot]);
}
