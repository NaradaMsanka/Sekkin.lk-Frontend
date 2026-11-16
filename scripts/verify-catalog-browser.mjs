import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

// Use an operator-supplied installed Playwright Core; it is not a site dependency.
const driverPath = process.env.PLAYWRIGHT_MODULE_PATH;
if (!driverPath) throw new Error('Set PLAYWRIGHT_MODULE_PATH to the installed playwright-core/index.mjs.');
const { chromium } = await import(pathToFileURL(driverPath).href);
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const snapshot = JSON.parse(fs.readFileSync('src/catalog/catalogSnapshot.json', 'utf8'));
const root = path.resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  let file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) file = path.join(root, 'index.html');
  for (const { key, value } of config.headers[0].headers) response.setHeader(key, value);
  response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const checks = [], errors = [], externalRequests = [];
function check(name, passed, detail = {}) {
  checks.push({ name, passed, detail });
  if (!passed) throw new Error(`${name}: ${JSON.stringify(detail)}`);
}
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  // Existing browser tokens must not cause authentication, storage access or API calls.
  await context.addInitScript(() => {
    localStorage.setItem('token', 'controlled-obsolete-test-token');
    localStorage.setItem('user', JSON.stringify({ role: 'ADMIN', email: 'synthetic@example.invalid' }));
    window.__catalogStorageCalls = [];
    for (const method of ['getItem', 'setItem', 'removeItem', 'clear']) {
      const original = Storage.prototype[method];
      Storage.prototype[method] = function (...args) {
        window.__catalogStorageCalls.push(method);
        return original.apply(this, args);
      };
    }
  });
  await context.route('**/*', route => {
    if (!route.request().url().startsWith(origin + '/')) {
      externalRequests.push({ url: route.request().url(), method: route.request().method() });
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const information = ['about', 'contact', 'privacy-policy', 'terms-and-conditions', 'shipping-policy', 'refund-policy'];
  for (const width of [320, 375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/product/1', ...information.map(value => `/${value}`), '/checkout', '/cart', '/login', '/register', '/admin', '/orders']) {
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.locator('main h1').waitFor();
      const state = await page.evaluate(() => ({
        width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        forms: document.forms.length, storage: window.__catalogStorageCalls,
        actions: [...document.querySelectorAll('a,button')].map(node => node.textContent.trim()).filter(text => /^(buy now|add to cart|checkout|sign in|sign up|register|place order)$/i.test(text)),
        missingImages: [...document.images].filter(node => node.loading !== 'lazy' && (!node.complete || node.naturalWidth === 0)).length,
      }));
      check(`Responsive, non-transactional direct route ${route} at ${width}`, response.status() === 200 && state.scroll <= state.width + 1 && state.forms === 0 && !state.storage.length && !state.actions.length && state.missingImages === 0, state);
      check(`Ordering notice remains visible ${route} at ${width}`, await page.getByRole('status').getByText(/Online ordering is temporarily unavailable/).count() === 1);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin, { waitUntil: 'networkidle' });
  check('Approved snapshot products and prices are rendered', await page.locator('article').count() === snapshot.products.length);
  await page.getByRole('textbox', { name: 'Search products' }).fill('no-such-synthetic-product');
  check('In-memory search filters the static catalog', await page.locator('article').count() === 0);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  check('Clearing filters restores approved products', await page.locator('article').count() === snapshot.products.length);
  await page.getByRole('button', { name: /quick view/i }).first().click();
  check('Product quick view works without purchase controls', await page.getByRole('dialog').count() === 1);
  await page.getByRole('button', { name: 'Close quick view' }).click();
  await page.goto(origin + '/contact', { waitUntil: 'networkidle' });
  for (const href of ['mailto:support@sekkin.lk', 'tel:+94740309918', 'https://wa.me/94740309918']) check(`Confirmed contact link ${href}`, await page.locator(`a[href="${href}"]`).count() > 0);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('presentation').getByRole('link', { name: 'Collection', exact: true }).click();
  check('Mobile navigation works', new URL(page.url()).pathname === '/');
  await page.waitForTimeout(300);
  check('No application JavaScript errors', errors.length === 0, { errors });
  check('No backend or third-party network requests', externalRequests.length === 0, { externalRequests });
  await page.screenshot({ path: 'docs/release-verification/catalog-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'docs/release-verification/catalog-desktop.png', fullPage: true });
  fs.writeFileSync('docs/release-verification/catalog-browser-smoke.json', JSON.stringify({ checkedAtUtc: new Date().toISOString(), scope: 'Actual built static catalog with Vercel CSP headers, isolated local HTTP server, old browser token fixture; no live records changed', browser: browser.version(), checks, errors, externalRequests }, null, 2) + '\n');
  console.log(JSON.stringify({ passed: checks.length, failed: 0, externalRequests: externalRequests.length }));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
