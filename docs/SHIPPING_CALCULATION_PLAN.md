# Fixed order delivery calculation - implemented locally

Updated 16 November 2026. The owner replaced the previous range with **LKR 350 for every normal order, islandwide Sri Lanka**. No threshold, location band, minimum order value or shipping discount applies. Return and exchange delivery responsibilities are unchanged.

## Calculation and authority

`Backend/src/main/java/com/cosmetic/ecommerce/service/OrderPricing.java` defines `DELIVERY_CHARGE = new BigDecimal("350.00")`. Both `OrderService.createOrder` and `createDirectOrder` use this one calculation:

```text
Merchandise subtotal = sum(stored catalog effective unit price x quantity)
Coupon discount = existing valid merchandise coupon, bounded by merchandise subtotal
Final order total = merchandise subtotal - coupon discount + 350.00
```

The effective unit price already includes any valid product sale. Product savings are not subtracted again. GLOW10/WELCOME10 reduce the effective merchandise subtotal by 10%; SAVE500 reduces it by 500 when it is at least 2500. Coupons never discount delivery. Existing unknown-code behavior remains zero discount. These code rules do not approve missing coupon business terms.

BigDecimal calculations round unit prices and coupon amounts to two decimals using HALF_UP. Existing Double order fields store the calculated amounts, preserving schema/API compatibility. Every new order explicitly stores 350 delivery and the resulting total. No historical row, schema or database default is rewritten, and no shipping migration is required.

The cart path reloads catalog products and disregards cart/client prices and totals. Both paths reject empty/invalid orders and validate stock/combined quantities before mutation. Cart HTTP monetary extras cannot override calculations; direct DTOs reject unsupported client amount fields. Existing transaction boundaries remain in place. Concurrent stock locking and request idempotency are still separate security/inventory work.

## Frontend and stored amounts

`src/content/delivery.js` mirrors the confirmed amount from `business.json` for estimates. Cart, checkout and direct checkout add it once per nonempty order. Quantity/coupon updates leave delivery at 350. Product prices and availability are recalculated by the backend when submitting; pre-submit summaries remain estimates, not reserved quotes.

Cart confirmation uses the returned stored fee/total. Direct confirmation/download use the returned fee, merchandise subtotal, coupon reduction and total. Customer/admin history display each order's stored fee and total; missing old fees display "Not recorded", and zero stays zero. They never apply today's fee to an old order. No standalone Cart Drawer exists in this checkout: the existing navigation drawer links to `/cart` and does not calculate totals.

The former advanced quotation proposal (quote IDs/versions/expiry, idempotency and reservation) is not implemented or required to choose the now-fixed fee. It must not be described as an existing feature. Product price changes between preview and submission remain subject to the backend's current catalog prices; a reserved-price/quote workflow would be separate work.

## Policy and readiness

The shipping charges section exactly states: "A fixed delivery charge of LKR 350 applies to every order. The delivery charge is displayed at checkout before you confirm your order."

Coverage is islandwide. The estimate remains 2-3 business days with possible courier/holiday delays. Processing, estimate start event, weekend arrangements, tracking, failed deliveries and delay communication stay unresolved. Only `shipping.charges` and `/shipping-policy#charges` clear; the strict gate is **61** and all global approvals remain false.

See [the implementation/test/release report](FIXED_DELIVERY_IMPLEMENTATION.md). No production data, push, merge or deployment was performed.
