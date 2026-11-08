# Future PayHere integration plan — not implemented

This task does not activate PayHere, KOKO or live card payments. The retained checkout method is COD. Business and security review must finish first.

PayHere Sandbox is separate from live payments and does not settle funds. Use a separate test account, the official test fixtures on provider-hosted pages, and no real customer card information. [Official Sandbox guidance](https://support.payhere.lk/sandbox-and-testing).

## Proposed implementation

1. Use hosted Checkout or the official SDK. Collect required customer contact/address fields; never create another card/CVC form.
2. Create an authenticated, idempotent payment attempt with an immutable server-priced order, two-decimal amount and currency. Plan stock reservation/release and expiry separately. Use decimal money calculations and review any future schema migration before applying it.
3. Generate the request hash on Spring Boot. Keep the domain-specific Merchant Secret only in server configuration; never in Vite variables, JavaScript bundles, logs or source control.
4. Add a public HTTPS `notify_url` receiving form-encoded callbacks. Its security boundary is signature verification, not a customer JWT. Verify the official checksum, merchant, stored order/attempt, exact amount/currency and status before writing payment state.
5. Persist payment identifiers and enforce transaction-level uniqueness/idempotency. Duplicate or out-of-order callbacks must not repeat confirmation, stock changes or fulfilment. An unsigned/mismatched callback must change nothing.
6. Only a verified successful notification may move an eligible attempt to PAID. Handle pending, cancelled, failed and chargeback states explicitly. Prevent late pending/failure messages from overwriting confirmed payment.
7. Return/cancel pages and SDK callbacks display backend state; they must never declare payment verified themselves. Show pending while notification is outstanding, with bounded read-only status checks.

The API/hash/notification requirements above follow the [official Checkout API](https://support.payhere.lk/api-&-mobile-sdk/checkout-api). Implementation should use its current exact parameter names and checksum rules, including two-decimal amount formatting. Do not copy a Merchant Secret into the documentation's client-side sample.

## Test and release criteria

- Sandbox: success, pending, cancellation, rejection, unknown order, missing fields, tampered checksum, wrong merchant/amount/currency, duplicate and reordered callbacks, refresh/back, interrupted network and concurrent attempts.
- Verify no PAN/CVC enters the application request model, logs, database, downloads, browser storage or monitoring tools. Store only payment metadata needed for operations.
- Verify the public callback reaches Render and responds reliably after idle/restart; do not assume a browser's success redirect means notification arrived. Add monitoring and an operational reconciliation procedure.
- Payment methods, capture/refund procedures, stock handling, delivery charges and customer support must match approved policies. KOKO remains disabled until its own authorised integration is completed.
- After owner approval, complete domain/app authorisation, live credentials and a separate controlled live release. Merchant approval, policy approval and successful Sandbox tests are different checks; none guarantees the others.

## Current blockers outside the payment integration itself

Confirm business identity/contact details and policies; replace/review generic catalog content and missing images through the normal owner/admin process; resolve the remaining security findings in the readiness report; review historical simulated-payment records against real financial records. Do not automatically mark old orders paid/unpaid or edit production inventory during this work.
