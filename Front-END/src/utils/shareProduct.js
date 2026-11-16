export async function shareProduct(product, browser = navigator, origin = window.location.origin) {
  const url = `${origin}/overview/${encodeURIComponent(product.productId)}`;
  if (typeof browser.share === 'function') {
    try {
      await browser.share({ title: product.name, text: `See ${product.name} on Nari Craft`, url });
      return { status: 'shared', url };
    } catch (error) {
      if (error.name === 'AbortError') return { status: 'cancelled', url };
    }
  }
  if (browser.clipboard?.writeText) {
    try {
      await browser.clipboard.writeText(url);
      return { status: 'copied', url };
    } catch { /* A visible manual-copy field is the final fallback. */ }
  }
  return { status: 'manual', url };
}
