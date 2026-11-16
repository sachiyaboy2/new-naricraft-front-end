import "react-hot-toast";
import test from 'node:test';
import assert from 'node:assert/strict';
import { unlink } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { rolldown } from 'rolldown';
import { parseWishlist, wishlistSnapshot, toggleWishlist, subscribeWishlist, WISHLIST_KEY } from '../src/utils/wishlistStore.js';
import { shareProduct } from '../src/utils/shareProduct.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const values = new Map();
const browserWindow = new EventTarget();
browserWindow.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
browserWindow.matchMedia = () => ({ matches: false });
globalThis.window = browserWindow;

test('favourites toggle, persist in storage, notify subscribers and tolerate corrupt values', () => {
  values.clear(); let notifications = 0;
  const stop = subscribeWishlist(() => notifications++);
  assert.equal(toggleWishlist('blouse-0001'), true);
  assert.deepEqual(parseWishlist(wishlistSnapshot()), ['blouse-0001']);
  assert.deepEqual(JSON.parse(values.get(WISHLIST_KEY)), ['blouse-0001']);
  assert.equal(toggleWishlist('blouse-0001'), false);
  assert.deepEqual(parseWishlist(wishlistSnapshot()), []);
  assert.equal(notifications, 2); stop();
  assert.deepEqual(parseWishlist('{bad'), []);
  assert.deepEqual(parseWishlist('["P1",null,3,"P1"]'), ['P1']);
});

test('favourites report blocked storage instead of falsely showing success', () => {
  const original = browserWindow.localStorage.setItem;
  browserWindow.localStorage.setItem = () => { throw new Error('Storage blocked'); };
  try { assert.throws(() => toggleWishlist('P1'), /Storage blocked/); }
  finally { browserWindow.localStorage.setItem = original; }
});

test('share uses native sharing, clipboard fallback, manual fallback and respects cancellation', async () => {
  const product = { productId: 'P 1', name: 'Blouse' }, origin = 'https://shop.example';
  let sent;
  assert.equal((await shareProduct(product, { share: async data => { sent = data; } }, origin)).status, 'shared');
  assert.equal(sent.url, 'https://shop.example/overview/P%201');
  let copied;
  assert.equal((await shareProduct(product, { clipboard: { writeText: async value => { copied = value; } } }, origin)).status, 'copied');
  assert.equal(copied, sent.url);
  assert.equal((await shareProduct(product, { clipboard: { writeText: async () => { throw new Error('Denied'); } } }, origin)).status, 'manual');
  assert.equal((await shareProduct(product, { share: async () => { const e = new Error(); e.name = 'AbortError'; throw e; } }, origin)).status, 'cancelled');
});

const sampleOrder = { _id: 'o1', orderId: 'NC-TEST', fullName: 'Test Customer', phone: '0771234567', status: 'Pending', totalPrice: 100, products: [{ productId: 'P1', name: 'Blouse', quantity: 1, price: 100 }], paymentStatus: 'Payment Pending' };

async function renderFixture(entry, transformSource, name) {
  const outputPath = resolve(root, `.tmp-verify-${name}.mjs`);
  const inputPath = resolve(root, entry).replaceAll('\\', '/');
  const bundle = await rolldown({
    input: inputPath,
    platform: 'node',
    external: id => !id.startsWith('.') && !id.startsWith('/') && !/^[A-Za-z]:/.test(id),
    transform: { jsx: { runtime: 'automatic' }, define: { 'import.meta.env.VITE_API_URL': '"http://localhost:5000"' } },
    plugins: [{ name: 'fixture-state', transform(code, id) { if (id.replaceAll('\\', '/') === inputPath) return { code: transformSource(code) }; } }],
  });
  try {
    await bundle.write({ file: outputPath, format: 'esm' });
    const module = await import(pathToFileURL(outputPath).href + `?${Date.now()}`);
    const component = module.default || module.ProductPage;
    return renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(component)));
  } finally { await bundle.close(); await unlink(outputPath).catch(() => {}); }
}

test('admin orders renders populated rows before any details modal is selected', async () => {
  const html = await renderFixture('src/pages/Admin/AddminOrdersPage.jsx', code => code.replace('useState([])', `useState(${JSON.stringify([sampleOrder])})`).replace('useState(true)', 'useState(false)'), 'orders');
  assert.match(html, /NC-TEST/); assert.match(html, /Test Customer/);
  assert.doesNotMatch(html, /role="dialog"/);
  assert.doesNotMatch(html, /<tr[^>]*>\s*<div/);
});

test('product overview renders one cart action plus the share action', async () => {
  const product = { productId: 'P1', name: 'Blouse', category: 'Blouses', price: 100, labelNo: 2, images: [], altNames: [] };
  const html = await renderFixture('src/pages/productOverView.jsx', code => code.replace('useState("loading")', 'useState("success")').replace('useState(null)', `useState(${JSON.stringify(product)})`), 'overview');
  assert.match(html, /aria-label="Share product"/);
  assert.equal((html.match(/Add to Cart/g) || []).length, 1);
});

test('payment details and balance collection render only inside the selected-order dialog', async () => {
  const selected = { ...sampleOrder, paymentPlan: 'Half Payment', paymentStatus: 'Partially Paid', balanceStatus: 'Pending', paidAmount: 50, remainingAmount: 50 };
  const html = await renderFixture('src/pages/Admin/AddminOrdersPage.jsx', code => code.replace('useState([])', `useState(${JSON.stringify([selected])})`).replace('useState(true)', 'useState(false)').replace('useState(null)', `useState(${JSON.stringify(selected)})`), 'order-dialog');
  assert.match(html, /role="dialog"/);
  assert.equal((html.match(/Record received balance/g) || []).length, 1);
  assert.doesNotMatch(html.slice(0, html.indexOf('role="dialog"')), /Payment: Partially Paid/);
});

test('Products renders a visible Favourites button even when the list is empty', async () => {
  const html = await renderFixture('src/pages/productPage.jsx', code => code.replace('useState(true)', 'useState(false)'), 'favourites-button');
  assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>♥ Favourites \(0\)<\/button>/);
  assert.match(html, /All products/);
});

test('Favourites mode renders saved products and excludes unsaved products', async () => {
  const products = [
    { productId: 'saved', name: 'Saved blouse', category: 'Blouses', price: 100, images: [] },
    { productId: 'unsaved', name: 'Unsaved blouse', category: 'Blouses', price: 200, images: [] },
  ];
  const html = await renderFixture('src/pages/productPage.jsx', code => code
    .replace('useState([])', `useState(${JSON.stringify(products)})`)
    .replace('const wishlist = useWishlist();', 'const wishlist = ["saved"];')
    .replace('const [isLoading, setIsLoading] = useState(true);', 'const [isLoading, setIsLoading] = useState(false);')
    .replace('const [favouritesOnly, setFavouritesOnly] = useState(false);', 'const [favouritesOnly, setFavouritesOnly] = useState(true);'), 'favourites-filter');
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>♥ Favourites \(1\)<\/button>/);
  assert.match(html, /Saved blouse/);
  assert.doesNotMatch(html, /Unsaved blouse/);
});
