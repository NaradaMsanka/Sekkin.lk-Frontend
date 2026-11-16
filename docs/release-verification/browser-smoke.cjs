const { chromium } = require(process.env.SEKKIN_PLAYWRIGHT_MODULE || 'playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const driverVersion = require((process.env.SEKKIN_PLAYWRIGHT_MODULE || 'playwright-core') + '/package.json').version;
const policySourceSha256 = createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'src/content/business.json'))).update(fs.readFileSync(path.join(process.cwd(), 'src/content/businessPages.js'))).digest('hex');
const business = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/business.json'), 'utf8'));
const wordingApproval = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'docs/release-verification/approved-policy-wording.json'), 'utf8'));
const base = 'http://127.0.0.1:4173';
const output = path.join(process.cwd(), 'docs', 'release-verification');
const artifactPrefix = process.env.SEKKIN_BROWSER_ARTIFACT_PREFIX || 'final-';
const artifactPath = name => path.join(output, artifactPrefix + name);
fs.mkdirSync(output, { recursive: true });
const checks = [], requests = [], errors = [];
const product = { id: 901, name: 'Fixture cleanser', brand: 'Test-only brand', category: 'Skincare', description: 'Isolated browser fixture, never a live listing.', ingredients: 'Test-only information', price: 2500, discountPrice: 2000, stockQuantity: 4, status: 'IN_STOCK', imageUrl: '', images: [] };
const soldOut = { ...product, id: 902, name: 'Fixture sold out', stockQuantity: 0, status: 'OUT_OF_STOCK' };
let cart = { id: 1, items: [{ id: 1, product, quantity: 1, price: 2000 }], totalPrice: 2000 };
const receipt = { orderId: 99001, customerName: 'Fixture buyer <b>literal</b>', customerPhone: '0000000000', customerEmail: 'buyer@example.test', shippingAddress: 'Test-only address', paymentMethod: 'COD', paymentStatus: 'PENDING_COD', deliveryCharge: 350, subtotal: 2000, totalAmount: 2150, discountAmount: 700, couponDiscount: 200, status: 'PENDING', orderDate: '2026-11-16T10:00:00', productName: product.name, quantity: 1, unitPrice: 2000, message: 'Order request received; business acceptance is pending. This acknowledgement is not proof of payment.' };
const orders = [{ id: 88001, deliveryCharge: 0, shippingAddress: 'Historical fixture address', totalAmount: 1000, status: 'DELIVERED', paymentMethod: 'COD', paymentStatus: 'PENDING_COD', orderDate: '2025-01-01T10:00:00' }, { id: 99002, deliveryCharge: 350, shippingAddress: 'Test-only address', totalAmount: 2150, status: 'PENDING', paymentMethod: 'COD', paymentStatus: 'PENDING_COD', inventoryReserved: true, orderDate: '2026-11-16T10:00:00' }];
let rejectLogoutAll = true;
function check(name, condition, detail) { checks.push({ name, passed: Boolean(condition), detail }); if (!condition) throw new Error(name + ': ' + JSON.stringify(detail)); }
async function visible(locator) { await locator.waitFor({ state: 'visible', timeout: 10000 }); }
async function responsive(page, name, modal = false) {
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return { navLayout: [...document.querySelectorAll('header .MuiToolbar-root > *')].map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 60), display: getComputedStyle(element).display, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width })), width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, dialogWidth: dialog?.clientWidth, dialogScroll: dialog?.scrollWidth, overflowElements: [...document.querySelectorAll('body *')].filter(element => element.getBoundingClientRect().right > innerWidth + 1).slice(-20).map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 80), right: element.getBoundingClientRect().right, width: element.getBoundingClientRect().width, className: String(element.className) })) };
    });
    if (dimensions.scroll > dimensions.width + 1) await page.screenshot({ path: artifactPath('overflow-diagnostic.png'), fullPage: true });
    check(`${name} responsive layout at ${width}`, dimensions.scroll <= dimensions.width + 1 && (!modal || dimensions.dialogScroll <= dimensions.dialogWidth + 1), dimensions);
    if (width === 320) await page.screenshot({ path: artifactPath(`${name}-320.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.SEKKIN_CHROME_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const approvedArchiveSha256 = createHash('sha256').update(wordingApproval.sourceBusiness).update(wordingApproval.sourcePages).digest('hex');
    check('owner-approved wording is linked to the exact archived source version', wordingApproval.sourceVersionVerified === true && approvedArchiveSha256 === wordingApproval.sourceVersion && business.policyWordingApproval.sourceVersion === wordingApproval.sourceVersion && wordingApproval.sourceVersion === 'abe2b80743126ab944c021e860b0a1f83ae220312b98642e629b617a4f0cf69b', { approvedArchiveSha256 });
    check('explicit temporary catalog approval remains separate from incomplete policy and payment signoffs', business.contactsConfirmed === true && business.catalogReviewed === true && business.catalogReviewApproval.temporaryPlaceholderImagesAccepted === true && business.catalogReviewApproval.actualProductPhotographyVerified === false && business.catalogReviewApproval.productionCatalogChanged === false && /^[0-9a-f]{64}$/.test(business.catalogReviewApproval.catalogVersionSha256) && business.policiesApproved === false && business.paymentSafetyReviewed === false && wordingApproval.fullPolicyCatalogSecuritySignoffsGranted === false, {});
    check('approved launch-date basis leaves genuine calendar effective and publication dates unassigned', business.policyEffectiveDateBasis === 'actual-public-launch-date' && business.policyEffectiveDate === null && business.policyPublicationDate === null && business.policyApprovedDate === null && wordingApproval.actualEffectiveDate === null && wordingApproval.actualPublicationDate === null, {});
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', serviceWorkers: 'block', acceptDownloads: true });
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === base) return route.continue();
      if (url.hostname !== 'sekkin-lk-backend.onrender.com' || !url.pathname.startsWith('/api/')) return route.abort();
      const method = request.method(), endpoint = url.pathname, body = request.postDataJSON();
      requests.push({ method, endpoint, body, idempotencyKey: request.headers()['idempotency-key'] });
      let data;
      if (endpoint === '/api/admin/dashboard') data = { totalOrders: 2, totalRevenue: orders.filter(order => order.codCollectedAt && order.paymentStatus === 'PAID').reduce((sum, order) => sum + order.totalAmount, 0), totalProducts: 2, totalUsers: 1, recentOrders: orders };
      else if (endpoint === '/api/auth/logout-all' && method === 'POST') return route.fulfill({ status: rejectLogoutAll ? 503 : 204, body: '' });
      else if (endpoint === '/api/admin/orders' && method === 'GET') data = orders;
      else if (/^\/api\/admin\/orders\/\d+\/(accept|cod-collection)$/.test(endpoint) && method === 'POST') {
        const order = orders.find(item => item.id === Number(endpoint.split('/')[4]));
        if (endpoint.endsWith('/accept')) Object.assign(order, { status: 'PROCESSING', acceptedAt: '2026-11-16T11:00:00', acceptedBy: 'admin@example.test', acceptanceReference: body.reference });
        else Object.assign(order, { paymentStatus: 'PAID', codCollectedAt: '2026-11-16T12:00:00', codCollectedBy: 'admin@example.test', codCollectionReference: body.reference });
        data = order;
      }
      else if (/^\/api\/orders\/\d+\/status$/.test(endpoint) && method === 'PATCH') {
        const order = orders.find(item => item.id === Number(endpoint.split('/')[3]));
        order.status = url.searchParams.get('status') || body?.status;
        data = order;
      }
      else if (endpoint === '/api/products') data = [product, soldOut];
      else if (endpoint === '/api/products/901') data = product;
      else if (endpoint === '/api/products/902') data = soldOut;
      else if (endpoint.endsWith('/reviews/eligibility')) data = { eligible: false, reason: 'Test-only fixture' };
      else if (endpoint.endsWith('/reviews')) data = [{ id: 70001, rating: 4, comment: 'Isolated review privacy fixture.', createdAt: '2026-11-16T10:00:00', userEmail: 'private-reviewer@example.test' }];
      else if (endpoint === '/api/cart/items' && method === 'POST') data = cart;
      else if (endpoint === '/api/cart/items/901' && method === 'PUT') { const qty = Number(url.searchParams.get('quantity')); cart = { ...cart, items: [{ id: 1, product, quantity: qty, price: qty * 2000 }], totalPrice: qty * 2000 }; data = cart; }
      else if (endpoint === '/api/cart' && method === 'GET') data = cart;
      else if (endpoint === '/api/orders/direct' && method === 'POST') {
        // Simulate an ambiguous lost response. The retry must retain its original key.
        if (requests.filter(item => item.endpoint === endpoint && item.method === method).length === 1) return route.abort();
        data = receipt;
      }
      else if (endpoint === '/api/orders' && method === 'POST') { data = { id: 99002, totalAmount: 2150, deliveryCharge: 350, status: 'PENDING', paymentStatus: 'PENDING_COD', paymentMethod: 'COD' }; cart = { id: 1, items: [], totalPrice: 0 }; }
      else if (endpoint === '/api/orders' && method === 'GET') data = orders;
      else return route.fulfill({ status: 404, json: { message: 'Unmatched isolated API fixture' } });
      return route.fulfill({ status: 200, json: data });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const routes = ['refund-policy', 'privacy-policy', 'terms-and-conditions', 'contact', 'about', 'shipping-policy'];
    for (const width of [1440, 375, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        const response = await page.goto(base + '/' + route);
        await visible(page.locator('main h1'));
        const data = await page.evaluate(() => ({ title: document.title, robots: document.querySelector('meta[name="robots"]')?.content, width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, footer: [...document.querySelectorAll('footer a[href]')].map(a => a.getAttribute('href')), warning: document.body.innerText.includes('REVIEW REQUIRED'), h1: document.querySelectorAll('main h1').length }));
        check(`public direct refresh and responsive layout /${route} at ${width}`, response.status() === 200 && data.h1 === 1 && data.warning && data.robots.includes('noindex') && data.title.includes('Draft') && data.scroll <= data.width + 1 && routes.every(item => data.footer.includes('/' + item)), data);
        if (route === 'contact') {
          const text = await page.locator('main').innerText();
          check(`confirmed contact details and links at ${width}`, text.includes('support@sekkin.lk') && text.includes('0740309918') && text.includes('Mahawattha, Batapola, Sri Lanka') && text.includes('24 hours') && await page.locator('main a[href="mailto:support@sekkin.lk"]').count() === 1 && await page.locator('main a[href="tel:+94740309918"]').count() === 1 && await page.locator('main a[href="https://wa.me/94740309918"]').count() === 1, {});
          check(`contact separates registered business and confirmed sole proprietor at ${width}`, text.includes('Registered business name') && text.includes('SEKKIN LK') && text.includes('Sole Proprietorship') && text.includes('Registered') && text.includes('260918038') && text.includes('Sole proprietor legal name') && text.includes('RAVINDU KAUSHAN') && !text.includes('Legal seller name\nSEKKIN LK'), {});
          const footer = await page.locator('footer').innerText();
          check(`footer displays registered sole proprietorship and approved launch-date basis at ${width}`, footer.includes('Registered business: SEKKIN LK') && footer.includes('Sole Proprietorship') && footer.includes('260918038') && footer.includes('Sole proprietor: RAVINDU KAUSHAN') && footer.includes('Policy effective date: the actual public launch date.') && footer.includes('Calendar effective and publication dates will be recorded at publication.') && !footer.includes('Policies effective 2026-11-16') && !footer.includes('dates await approval'), {});
          await page.screenshot({ path: artifactPath(`contact-${width}.png`), fullPage: true });
        }
        if (route === 'refund-policy') {
          const text = await page.locator('main').innerText();
          check(`confirmed ordinary return rules preserve unresolved remedies at ${width}`, text.includes('seven days') && text.includes('seal intact') && text.includes('customer after delivery') && text.includes('consumer rights') && text.includes('REVIEW REQUIRED'), {});
          check(`return charge preserves wrong damaged faulty exceptions at ${width}`, text.includes('LKR 500') && text.includes('customer responsibility') && text.includes('not charged twice') && text.includes('LKR 0') && text.includes('SEKKIN LK covers') && text.includes('faulty products'), {});
          if (width === 375) await page.screenshot({ path: artifactPath('refund-375.png'), fullPage: true });
        }
        if (route === 'shipping-policy') {
          const text = await page.locator('main').innerText();
          check(`fixed shipping and approved dispatch estimate at ${width}`, text.includes('LKR 350 applies to every order') && text.includes('Koombiyo Delivery') && !text.includes('free to LKR 350') && text.includes('after order confirmation') && text.includes('one business day'), {});
          check(`courier policy discloses three attempts zero attempt fee and conditional return charge at ${width}`, text.includes('three delivery attempts') && text.includes('LKR 0') && text.includes('LKR 500') && text.includes('customer responsibility') && text.includes('applies only once') && text.includes('wrong, damaged or faulty') && text.includes('not added to normal checkout') && text.includes('no automated returned-parcel'), {});
          if (width === 375) await page.screenshot({ path: artifactPath('shipping-375.png'), fullPage: true });
        }
        if (route === 'about') {
          const text = await page.locator('main').innerText();
          check(`about accurately identifies registered sole proprietor at ${width}`, text.includes('SEKKIN LK') && text.includes('registered sole proprietorship') && text.includes('260918038') && text.includes('RAVINDU KAUSHAN') && text.includes('not a partnership or limited company'), {});
        }
        if (route === 'terms-and-conditions') {
          const text = await page.locator('main').innerText();
          check(`prices include applicable taxes without VAT fee and coupons remain enabled at ${width}`, text.includes('include applicable taxes') && text.includes('not VAT registered') && text.includes('does not add a separate VAT charge') && text.includes('GLOW10') && text.includes('WELCOME10') && text.includes('SAVE500') && text.includes('merchandise only, never the delivery charge'), {});
          check(`COD terms require actual courier settlement evidence at ${width}`, text.includes('courier collects') && text.includes('courier settlement reports') && text.includes('actual courier settlement evidence') && text.includes('failed collection') && text.includes('not proof of payment'), {});
          if (width === 1440) check('terms disclose owner-approved temporary illustrative product images without claiming verified product photography', text.includes('temporary illustrative placeholders') && text.includes('may not depict the item supplied') && text.includes('owner has approved this temporary presentation') && text.includes('original product imagery after launch') && !text.includes('identified inaccurate or missing product imagery must be corrected'), {});
        }
        if (route === 'privacy-policy' && width === 1440) {
          const text = await page.locator('main').innerText();
          check('privacy discloses saved wishlist records and hashed transient abuse counters', text.includes('Saved wishlist records link your account') && text.includes('short-lived request counters in memory') && text.includes('hashes of the request address') && text.includes('submitted login identity') && text.includes('actual hosted proxy and logging behavior still require verification'), {});
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + '/');
    await visible(page.getByRole('link', { name: 'View Fixture cleanser', exact: true }));
    check('catalog displays server fixture and stock state', await page.getByRole('button', { name: 'Out of stock', exact: true }).isDisabled(), {});
    const whatsappLinks = await page.locator('a[href*="wa.me"]').evaluateAll(links => links.map(link => link.href));
    check('all visible storefront WhatsApp links use the confirmed number', whatsappLinks.length > 0 && whatsappLinks.every(href => href.startsWith('https://wa.me/94740309918')), whatsappLinks);
    await page.getByRole('button', { name: 'Quick view Fixture cleanser', exact: true }).click();
    const quickView = page.getByRole('dialog');
    await visible(quickView);
    check('product quick view has the confirmed WhatsApp link and honest Buy now action', (await quickView.getByRole('link', { name: 'Ask about this product' }).getAttribute('href')).startsWith('https://wa.me/94740309918?text=') && await quickView.getByRole('button', { name: 'Buy now', exact: true }).count() === 1 && await quickView.getByRole('button', { name: 'Pay now', exact: true }).count() === 0, {});
    await page.getByRole('button', { name: 'Close product preview', exact: true }).click();
    await page.goto(base + '/product/901');
    await visible(page.getByRole('button', { name: 'Buy now', exact: true }));
    await page.getByRole('tab', { name: /Reviews \(/ }).click();
    await visible(page.getByText('Isolated review privacy fixture.', { exact: true }));
    check('public review UI never derives author labels from account emails', (await page.locator('main').innerText()).includes('Customer') && !(await page.locator('main').innerText()).includes('private-reviewer'), {});
    await page.getByRole('tab', { name: 'Description', exact: true }).click();
    await page.getByRole('button', { name: 'Buy now', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await visible(dialog);
    check('direct checkout exposes no raw card inputs', await dialog.locator('input[autocomplete^="cc-"], input[name*="card" i], input[name*="cvc" i], input[name*="cvv" i]').count() === 0, {});
    check('checkout has public policy links before submitting', await dialog.locator('a[href="/refund-policy"]').count() > 0 && await dialog.locator('a[href="/privacy-policy"]').count() > 0 && await dialog.locator('a[href="/terms-and-conditions"]').count() > 0, {});
    await dialog.getByLabel('Full name', { exact: false }).fill('Fixture buyer <b>literal</b>');
    await dialog.getByLabel('Phone number', { exact: false }).fill('0000000000');
    await dialog.getByLabel('Email', { exact: false }).fill('buyer@example.test');
    await dialog.getByLabel('Delivery address', { exact: false }).fill('Test-only address');
    check('direct checkout discloses fixed delivery before submission', (await dialog.innerText()).includes('Rs. 350.00') && (await dialog.innerText()).includes('Rs. 2350.00') && !(await dialog.innerText()).includes('provisional'), {});
    check('normal direct checkout never adds the separate conditional return charge or VAT fee', (await dialog.innerText()).includes('Rs. 2350.00') && !(await dialog.innerText()).includes('Rs. 2850.00') && !(await dialog.innerText()).includes('VAT charge'), {});
    await dialog.getByRole('button', { name: 'Increase quantity', exact: true }).click();
    check('direct quantity changes keep one fee', (await dialog.innerText()).includes('Rs. 4350.00'), {});
    await dialog.getByLabel('Coupon code', { exact: true }).fill('SAVE500');
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click();
    check('direct flat coupon discounts merchandise only', (await dialog.innerText()).includes('Rs. 3850.00') && (await dialog.innerText()).includes('Rs. 350.00'), {});
    await dialog.getByRole('button', { name: 'Decrease quantity', exact: true }).click();
    check('direct coupon minimum updates with quantity', (await dialog.innerText()).includes('Rs. 2350.00'), {});
    await dialog.getByLabel('Coupon code', { exact: true }).fill('GLOW10');
    await dialog.getByRole('button', { name: 'Apply', exact: true }).click();
    check('direct percentage coupon leaves delivery unchanged', (await dialog.innerText()).includes('Rs. 2150.00') && (await dialog.innerText()).includes('Rs. 350.00'), {});
    await responsive(page, 'direct-checkout', true);
    await dialog.getByRole('button', { name: /Place COD order/ }).click();
    await visible(dialog.getByText(/The result is unclear\. Retry with unchanged details/));
    const downloadPromise = page.waitForEvent('download');
    await dialog.getByRole('button', { name: /Place COD order/ }).click();
    const download = await downloadPromise;
    const file = await download.path();
    const confirmation = fs.readFileSync(file, 'utf8');
    await visible(dialog.getByRole('heading', { name: 'Order request received', exact: true }));
    const direct = requests.filter(request => request.endpoint === '/api/orders/direct');
    check('mocked COD retry contains no card or payment-status fields', direct.length === 2 && direct.every(item => item.body.paymentMethod === 'COD' && !Object.keys(item.body).some(key => /card|cvv|cvc|paymentStatus/i.test(key))), direct);
    check('lost direct response retries the unchanged intent with the same key', direct.length === 2 && direct[0].idempotencyKey === direct[1].idempotencyKey && JSON.stringify(direct[0].body) === JSON.stringify(direct[1].body), {});
    check('direct request supplies retry key and reviewed total without overriding server pricing', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(direct[0].idempotencyKey) && direct[0].body.expectedTotal === 2150 && (await dialog.innerText()).includes('PENDING'), {});
    check('confirmation remains unpaid and downloadable text is escaped', (await dialog.innerText()).includes('PENDING_COD') && confirmation.includes('&lt;b&gt;literal&lt;/b&gt;') && confirmation.includes('not proof of payment') && !confirmation.includes('Fixture buyer <b>'), {});
    check('product savings are included rather than shown as another deduction', (await dialog.innerText()).includes('Savings included') && confirmation.includes('Savings included:') && !confirmation.includes('Discount Saved:'), {}); await page.screenshot({ path: artifactPath('cod-confirmation-1440.png'), fullPage: true });
    check('direct confirmation and download use stored server amounts', (await dialog.innerText()).includes('Rs. 2150.00') && confirmation.includes('Rs. 2150.00') && confirmation.includes('Rs. 350.00') && confirmation.includes('Coupon savings:') && (await dialog.innerText()).includes('Rs. 200.00'), {});
    await responsive(page, 'cod-confirmation', true);
    const token = [Buffer.from('{}').toString('base64url'), Buffer.from(JSON.stringify({ sub: 'buyer@example.test', role: 'USER', exp: 9999999999 })).toString('base64url'), 'fixture-not-valid-on-server'].join('.');
    await page.evaluate(value => localStorage.setItem('token', value), token);
    await page.goto(base + '/cart');
    await visible(page.getByRole('heading', { name: 'Your cart', exact: true }));
    await visible(page.getByRole('button', { name: 'Increase quantity of Fixture cleanser', exact: true }));
    check('cart discloses fixed delivery amount', (await page.locator('main').innerText()).includes('Rs. 350.00') && (await page.locator('#cart-total').innerText()).includes('2,350.00'), {});
    await responsive(page, 'cart');
    await page.getByRole('button', { name: 'Increase quantity of Fixture cleanser', exact: true }).click();
    await page.waitForFunction(() => document.body.innerText.includes('Cart quantity updated.'));
    check('cart quantity uses updated mocked server total', requests.some(request => request.method === 'PUT' && request.endpoint === '/api/cart/items/901') && cart.totalPrice === 4000 && (await page.locator('#cart-total').innerText()).includes('4,350.00'), { total: cart.totalPrice });
    cart = { id: 1, items: [{ id: 1, product, quantity: 1, price: 2000 }], totalPrice: 2000 };
    await page.goto(base + '/checkout');
    await visible(page.locator('#checkout-address'));
    check('cart checkout discloses fixed delivery amount', (await page.locator('main').innerText()).includes('Rs. 350.00') && (await page.locator('#checkout-total').innerText()).includes('2,350.00'), {});
    check('normal cart checkout keeps tax-inclusive merchandise plus delivery without return fee', (await page.locator('#checkout-total').innerText()).includes('2,350.00') && !(await page.locator('#checkout-total').innerText()).includes('2,850.00') && !(await page.locator('main').innerText()).includes('VAT charge'), {});
    await responsive(page, 'cart-checkout');
    await page.locator('#checkout-address').fill('Test-only address');
    await page.locator('#checkout-phone').fill('0000000000');
    await page.getByRole('button', { name: 'Use GLOW10', exact: true }).click();
    check('cart coupon leaves delivery unchanged', (await page.locator('#checkout-total').innerText()).includes('2,150.00') && (await page.locator('main').innerText()).includes('Rs. 350.00'), {});
    await page.getByRole('button', { name: 'Place order', exact: true }).click();
    await visible(page.getByRole('link', { name: 'View my orders', exact: true }));
    check('cart confirmation uses server delivery and final total', (await page.locator('main').innerText()).includes('Rs. 350.00') && (await page.locator('main').innerText()).includes('2,150.00'), {});
    const placed = requests.filter(request => request.method === 'POST' && request.endpoint === '/api/orders');
    check('cart checkout sends reachable-phone field, address and coupon without card credentials', placed.length === 1 && placed[0].body.shippingAddress === 'Test-only address' && placed[0].body.customerPhone === '0000000000' && placed[0].body.couponCode === 'GLOW10' && !JSON.stringify(placed[0].body).includes('card'), placed);
    check('cart request supplies retry key, intended items and reviewed total', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(placed[0].idempotencyKey) && placed[0].body.expectedTotal === 2150 && placed[0].body.cartItems?.[0]?.productId === 901 && placed[0].body.cartItems?.[0]?.quantity === 1, {});
    await page.goto(base + '/orders');
    await visible(page.getByRole('heading', { name: 'My Orders', exact: true }));
    check('mocked order history loads pending order', (await page.locator('main').innerText()).includes('Pending'), {});
    const historical = page.getByRole('row').filter({ hasText: '#88001' });
    check('historical order keeps zero delivery and original total', (await historical.innerText()).includes('Rs. 1000.00') && (await historical.innerText()).includes('Rs. 0.00'), {});
    await page.goto(base + '/admin');
    await page.getByRole('tab', { name: /Order Reports/ }).click();
    const adminHistorical = page.getByRole('row').filter({ hasText: '#88001' });
    await visible(adminHistorical);
    check('admin history keeps stored amounts', (await adminHistorical.innerText()).includes('1,000') && (await adminHistorical.innerText()).includes('Rs. 0.00'), {});
    const adminNew = page.getByRole('row').filter({ hasText: '#99002' });
    check('admin order shows stored fixed fee and total', (await adminNew.innerText()).includes('2,150') && (await adminNew.innerText()).includes('Rs. 350.00'), {});
    check('admin report uses the protected all-orders route', requests.some(request => request.endpoint === '/api/admin/orders' && request.method === 'GET'), {});
    await adminNew.getByRole('button', { name: 'Verify and accept request', exact: true }).click();
    let action = page.getByRole('dialog');
    check('acceptance cannot submit without explicit evidence and attestation', await action.getByRole('button', { name: 'Save verified action', exact: true }).isDisabled(), {});
    await action.getByLabel('Acceptance confirmation reference', { exact: false }).fill('STAGING-ACCEPT-ONLY');
    await action.getByRole('checkbox').check();
    await action.getByRole('button', { name: 'Save verified action', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    check('admin acceptance sends reference and stays unpaid', requests.some(request => request.endpoint === '/api/admin/orders/99002/accept' && request.body.reference === 'STAGING-ACCEPT-ONLY') && orders.find(order => order.id === 99002).status === 'PROCESSING' && orders.find(order => order.id === 99002).paymentStatus === 'PENDING_COD', {});
    await adminHistorical.getByRole('button', { name: 'Record verified COD collection', exact: true }).click();
    action = page.getByRole('dialog');
    check('admin COD collection explicitly requires courier settlement verification', (await action.innerText()).includes('actual courier settlement report') && (await action.innerText()).includes('failed collection is insufficient'), {});
    await action.getByLabel('Collection evidence reference', { exact: false }).fill('STAGING-CASH-ONLY');
    await action.getByRole('checkbox').check();
    await action.getByLabel('Verified collected amount (LKR)', { exact: false }).fill('999');
    await action.getByRole('button', { name: 'Save verified action', exact: true }).click();
    await visible(action.getByText('The verified collection amount must equal the stored order total.', { exact: true }));
    check('wrong collection amount never reaches the mocked API', requests.every(request => !request.endpoint.endsWith('/cod-collection')), {});
    await action.getByLabel('Verified collected amount (LKR)', { exact: false }).fill('1000');
    await action.getByRole('button', { name: 'Save verified action', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    check('verified collection sends exact historical total and preserves zero delivery', requests.some(request => request.endpoint === '/api/admin/orders/88001/cod-collection' && request.body.amount === 1000 && request.body.reference === 'STAGING-CASH-ONLY') && orders[0].deliveryCharge === 0 && orders[0].totalAmount === 1000 && orders[0].paymentStatus === 'PAID', {});
    for (const route of ['cart', 'checkout', 'orders', 'product/901']) {
      const response = await page.goto(base + '/' + route); check('built SPA direct request /' + route, response.status() === 200, {});
    }
    await page.getByRole('button', { name: 'Your account', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Log out on all devices', exact: true }).click();
    await visible(page.getByText('We could not confirm logout on all devices. Please try again.', { exact: true }));
    check('failed all-device logout never reports revocation success or discards the local session', Boolean(await page.evaluate(() => localStorage.getItem('token'))), {});
    rejectLogoutAll = false;
    await page.getByRole('menuitem', { name: 'Log out on all devices', exact: true }).click();
    await page.waitForURL(base + '/login');
    check('successful all-device logout calls revocation before clearing the local token', requests.filter(request => request.endpoint === '/api/auth/logout-all').length === 2 && !(await page.evaluate(() => localStorage.getItem('token'))), {});
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto(base + '/checkout');
    await page.waitForURL(base + '/login');
    check('unauthenticated checkout redirects to login', page.url().endsWith('/login'), {});
    check('no page runtime errors', errors.length === 0, errors);
    check('all API requests targeted expected hosted Render URL and were intercepted', requests.length > 0, { apiRequests: requests.length });
  } catch (error) { checks.push({ name: 'harness completion', passed: false, detail: error.stack }); process.exitCode = 1; }
  finally {
    await browser.close();
    const result = { date: '2026-11-16', artifactPrefix, driverVersion, browserVersion: browser.version(), policySourceSha256, mode: 'Local built Vite preview; isolated browser API fixtures; every external request intercepted or aborted; no live transactions', checks, errors, passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length };
    fs.writeFileSync(artifactPath('browser-smoke.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ passed: result.passed, failed: result.failed, failures: checks.filter(c => !c.passed) }, null, 2));
  }
})();



