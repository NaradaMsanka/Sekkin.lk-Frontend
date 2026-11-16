# Consolidated final policy review package

Prepared 16 November 2026 (Asia/Colombo) from the current business configuration and six existing policy/information pages, including Cancellation and Exchange sections within the existing Refund & Return page. The owner has now approved consolidated wording version **abe2b807**, including consumer remedies, liability and Sri Lankan governing-law/dispute clauses. This is owner wording approval, not an independent legal opinion or proof that factual/operator requirements are complete. No previously confirmed business decision or approved wording is requested again.

**Review version:** SHA-256 of business.json followed by businessPages.js: `ac20c111743243983e3b24e63600dcaa550ce98c09f8b437dfb3af68295c84df`. This identifies the current prepared source, separately from the approved wording baseline. **Current strict readiness: 10 unresolved messages.** Source configuration/readiness rules, fixed delivery and historical amounts are preserved.

The exact approved baseline **abe2b80743126ab944c021e860b0a1f83ae220312b98642e629b617a4f0cf69b** was reconstructed and its hash verified before the approval was applied. [The archived source and approval evidence](release-verification/approved-policy-wording.json) preserve it. Subsequent source-verified wishlist/hashed abuse-counter disclosures and approval-status wording are identified separately; no commercial rule or approved consumer/liability/law clause was silently changed. The complete factual policy sign-off and publication remain pending.

## Recorded wording approval and publication dates

The legal seller and data controller is **RAVINDU KAUSHAN**, sole proprietor carrying on business as **SEKKIN LK**. The owner expressly approved the prepared package and chose **the actual public launch date of SEKKIN.LK** as the effective-date basis. No additional date decision is required now. Actual effective/publication calendar dates remain null until the real authorized launch/publication event; neither is backdated or replaced with an earlier approval date.

The approved consumer/remedy, liability, law/dispute and update sections no longer carry owner-wording review markers. The owner subsequently accepted the inspected dummy imagery for initial release and will replace it after deployment; `catalogReviewed=true` records that temporary scope, with original-product photography explicitly unverified. Remaining draft/review markers identify actual hosting, retention and historical-payment verification. `policiesApproved` and `paymentSafetyReviewed` remain false until their own factual/technical requirements are satisfied. The owner has not authorized automatic deployment, credential rotation or production catalog edits.

## Outstanding operator disclosures and accepted temporary catalog scope

- Verify actual Vercel, Render, Supabase and Cloudinary processing/account regions, authorized access/transfers and contractual arrangements. Provider names do not establish data residency.
- Review and demonstrate the proposed support-record 12-month, application-log 30-day and database-backup 30-day targets against actual provider controls, required order-record retention, deletion/anonymization and backup expiration. These were approved for review, not declared implemented. Do not promise automated deletion or apply the 30-day backup target as an order-record retention rule.
- Complete historical simulated-payment/log exposure review and use accurate payment-data disclosure. Current code collecting no cards does not prove that earlier records/logs never did.
- Current catalog approval is tied to the actual snapshot in [the catalog review](FINAL_CATALOG_REVIEW.md). The owner knowingly accepts the identified dummy/missing-image presentation for the initial release and will replace it after deployment. Terms disclose temporary illustrative imagery; these findings are recorded post-launch follow-up, not remaining release blockers. `actualProductPhotographyVerified=false` preserves the distinction. No production records were changed.
- Verify the audited COD workflow with actual courier settlement evidence, hosted security/session/inventory/idempotency controls and the reviewed migration/runtime configuration. Passing content checks alone is not paymentSafetyReviewed.

## Confirmed business identity and commercial rules

**SEKKIN LK**, Registered Sole Proprietorship, business registration **260918038**; brand **SEKKIN.LK**, trading name **sekkinLK**. Address **Mahawattha, Batapola, Sri Lanka**; email **support@sekkin.lk**; phone/WhatsApp **0740309918**; 24-hour business availability without a guaranteed immediate staffed response. Registration is owner-confirmed, not an independent registry verification. The confirmed legal seller and responsible data controller is **RAVINDU KAUSHAN**, carrying on business as **SEKKIN LK**.

Prices are in LKR, include applicable taxes, and the business is not VAT registered. Normal checkout delivery remains LKR 350 per order. Three courier attempts, LKR 0 failed-attempt fee and the separate conditional LKR 500 customer-responsibility returned-parcel charge are disclosed in the policies. The return charge never applies automatically to every checkout, never applies twice to one applicable returned parcel, and is borne by the business for wrong/damaged/faulty goods. No returned-parcel fee automation is claimed.

## Verified existing coupon behavior

Inspected Backend/src/main/java/com/cosmetic/ecommerce/service/OrderPricing.java, frontend src/content/delivery.js, request DTOs, checkout fields and admin/controller sources. The feature remains enabled; no code or restriction was invented.

| Rule | Actual implementation |
| --- | --- |
| GLOW10 / WELCOME10 | 10% off effective merchandise subtotal, rounded to two decimals. |
| SAVE500 | LKR 500 off when effective merchandise subtotal is at least LKR 2,500. |
| Merchandise / delivery | Coupon capped at merchandise subtotal; fixed LKR 350 delivery is never discounted. |
| Existing product sales | Coupon calculation uses sale-adjusted effective prices, so a product sale and one coupon can combine. |
| Multiple coupons | One coupon-code string per order; no multi-code input or coupon-to-coupon combination. |
| Matching / invalid code | Trimmed and uppercased; unknown code or unmet SAVE500 minimum produces zero coupon discount. |
| Eligibility | No per-customer, category or product restriction configured; SAVE500 minimum is the only code-specific threshold. |
| Expiration / usage | No expiry dates or per-customer/global usage counters configured. This describes the current controls, not an invented forever-valid guarantee. |
| Admin management | No coupon CRUD/configuration endpoint or coupon-management UI identified; coupon behavior is in source code. |

## Primary-source review supporting the prepared clauses

Consumer remedies are drafted to preserve mandatory rights and access to competent bodies rather than impose a universal statutory deadline or blanket exclusion. The [Consumer Affairs Authority Act, section 13](https://www.caa.gov.lk/web/images/Act/CAA_Act_E.pdf) describes CAA inquiry/remedy powers. [CAA Direction 91, Gazette 2332/15](https://documents.gov.lk/view/extra-gazettes/2023/5/2332-15_E.pdf) addresses accurate terms/charges, pre-confirmation order and delivery summaries, durable transaction information, privacy and redress. This source-informed drafting is not a legal compliance certification; exact application to this business remains part of final review.

Personal seller/controller identity is not replaced by the business name. An [official Supreme Court judgment, SC Appeal 25/2021](https://supremecourt.lk/?doc_id=e04260a0-19fd-4a9d-bd79-2c3943866fde&filename=sc_appeal_25_2021.pdf&melsta_doc_download=1) explains the absence of separate legal personality for a sole proprietorship (official indexed judgment, p. 11; direct retrieval currently returns the redesigned site). The [PDPA interpretation of controller](https://www.dpa.gov.lk/acts/Data%20Protection%20Act%20SL%20-%20English%20%282%29.pdf) concerns the actual person/entity determining processing. Requiring the correct person here follows that distinction and the owner's explicit instruction; no independently verified statutory requirement to display a particular personal-name format is asserted.

Current commencement was checked rather than copying older dates: [Gazette 2498/16](https://www.dpa.gov.lk/Gazet/2498-16_E.pdf) appoints 1 January 2027 for sections 2/3 and Parts I/III. The [DPA's current notice](https://www.dpa.gov.lk/privacy-notice) states that Part II data-subject rights and Part VII penalties are not yet active. The approved 30-calendar-day privacy response aim is therefore presented as the business process, without claiming a currently active universal PDPA deadline or full compliance. CAA consumer/privacy requirements are not treated as suspended by that timetable. Verify any subsequent commencement change before final publication.

## Prepared page text

The following text is generated from the actual existing policy components. REVIEW REQUIRED/draft statements remain only for outstanding factual/operator disclosures and final wording approval. This package is prepared for one consolidated review; it is not evidence of publication.

### Refund & Return Policy - /refund-policy

Request a return or exchange within seven days of receiving your order. Read the ordinary return conditions and the separate guidance for wrong, damaged or faulty goods below.

#### Return eligibility & time limits - #eligibility

Customers may request a change-of-mind return for unused, unopened products in their original packaging with the seal intact. Wrong, damaged or faulty products should be reported separately using the support contacts below.

Customers may request a return within seven days of receiving their order. This ordinary return window does not remove applicable mandatory rights concerning wrong, damaged or faulty goods.

#### Damaged, defective or incorrect products - #damaged-items

If an item is wrong, arrives damaged or is faulty, contact support@sekkin.lk or WhatsApp 0740309918 with your order number, product details, reason and relevant photographs. Sekkin.lk covers the return delivery charge in these cases and evaluates these complaints separately from ordinary change-of-mind returns. Wait for return authorization and instructions before sending goods. Returned goods are inspected within two business days of receipt, and the outcome is communicated through your supplied contact channel. If a return is rejected, you will receive an explanation and may request further review through the same support contacts. Applicable mandatory consumer rights are preserved.

#### Product condition, packaging & hygiene - #condition

Products returned because of a change of mind must be unused, unopened and in their original packaging with the seal intact.

Opened bottles, broken seals and damage caused by the customer after delivery are excluded from ordinary change-of-mind returns. These hygiene/condition restrictions do not exclude remedies for wrong, damaged-on-arrival or faulty products, or override applicable mandatory consumer rights.

#### How to request a return - #request

Submit return requests to support@sekkin.lk or WhatsApp 0740309918 with your order number, product details, reason and relevant photographs. Wait for return authorization and return instructions before sending products. The approved return destination is Mahawattha, Batapola, Sri Lanka; follow the specific instructions supplied for your authorized return. Returned products are inspected within two business days of receipt. The inspection outcome is sent through your supplied contact channel; a rejected return includes an explanation and a way to request further review through support.

Contact SEKKIN LK at support@sekkin.lk, call or WhatsApp 0740309918, or write to Mahawattha, Batapola, Sri Lanka. Business availability is 24 hours; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, Mahawattha, Batapola, Sri Lanka; follow the return instructions supplied by support.

#### Return shipping - #return-shipping

Customers pay applicable return delivery charges for ordinary change-of-mind returns. The courier return charge is LKR 500 for a parcel returned due to customer responsibility, including an incorrect delivery address, repeated unavailability after the three delivery attempts, refusal of a correctly supplied order or an ordinary change-of-mind return where that courier charge applies. This charge is disclosed before payment is required and is not charged twice for the same applicable returned parcel. A failed delivery attempt itself costs LKR 0. SEKKIN LK covers the applicable return delivery charge for wrong, damaged-on-arrival or faulty products. These rules do not restrict applicable mandatory consumer rights.

#### Refund procedure & timing - #refunds

Refunds are processed after the returned product is received, inspected and approved. Approved COD refunds are made by bank transfer, with the necessary transfer details arranged directly with the customer through support. The inspection outcome is communicated through your supplied contact channel. A rejected return includes a clear explanation and a way to request further review through support. Never send card numbers, expiry dates or security codes for a refund.

Approved refunds are processed within seven business days after the return inspection is completed and the refund is approved. Returned goods are inspected within two business days of receipt, and the inspection outcome is communicated through your supplied contact channel.

#### Order cancellations - #cancellations

Customers may cancel before dispatch by emailing support@sekkin.lk, calling or sending a WhatsApp message to 0740309918 with their order number. Cancellation is confirmed when Sekkin.lk sends a cancellation confirmation to the customer. After dispatch, ordinary cancellation is unavailable; customers may request a return under this policy. Applicable mandatory consumer rights are not excluded.

#### Exchanges - #exchanges

Exchange requests may be made within seven days of receiving an order, subject to replacement stock. Ordinary exchange products must be unused, unopened and in their original sealed packaging. Approved exchanges are processed within two business days after the returned product is received and inspected, subject to stock availability. Customers pay exchange delivery charges unless Sekkin.lk sent the wrong item or the product arrived damaged or faulty. Any additional price difference must be settled before replacement dispatch. If the replacement costs less, the approved price difference is refunded by the bank-transfer method described in this policy.

#### Customer rights - #rights

The ordinary seven-day change-of-mind period, sealed-product conditions and customer-responsibility return charge do not remove applicable remedies for wrong, damaged, faulty or nonconforming goods. A remedy, including an appropriate replacement, refund or compensation where applicable, is assessed under the circumstances and applicable Sri Lankan law. You may seek assistance from the Consumer Affairs Authority or other competent authorities or courts without first completing the business's internal complaint process.

### Privacy Policy - /privacy-policy

This privacy policy remains a draft while actual hosting, processing-location, retention and historical-payment disclosures are verified. The owner has approved the prepared policy wording.

#### Who is responsible for your information - #controller

SEKKIN LK is a registered sole proprietorship (business registration 260918038), operating the SEKKIN.LK brand and using the trading name sekkinLK.

RAVINDU KAUSHAN is the legal seller and sole proprietor carrying on business as SEKKIN LK (business registration 260918038), using the SEKKIN.LK brand and sekkinLK trading name. RAVINDU KAUSHAN is responsible for the business's customer-information processing. Privacy enquiries and verified access, correction or deletion requests may be sent to support@sekkin.lk or the business address, Mahawattha, Batapola, Sri Lanka. SEKKIN LK is a sole proprietorship, not a separate limited company or partnership.

Contact SEKKIN LK at support@sekkin.lk, call or WhatsApp 0740309918, or write to Mahawattha, Batapola, Sri Lanka. Business availability is 24 hours; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, Mahawattha, Batapola, Sri Lanka; follow the return instructions supplied by support.

#### Information used by the website - #information

Registration collects a name, email address and password. Login uses email and password. The backend uses password hashing and issues a login token.

The cart checkout collects a delivery address, reachable delivery phone and optional coupon. Direct COD checkout also collects customer name, phone number, email and an optional postal code. Orders record products, quantities, prices, delivery details and order/payment status. Authorized collection records include the administrator, time and courier-evidence reference needed for COD reconciliation; do not submit card credentials.

Product reviews display a rating, written comment and date. The reviewed local API omits reviewer account emails and the storefront labels authors as Customer. Production deployment and historical exposure still require verification.

Saved wishlist records link your account to selected products and the time they were saved. The reviewed backend also keeps short-lived request counters in memory, keyed by hashes of the request address and, for login controls, the submitted login identity. These counters support abuse prevention; actual hosted proxy and logging behavior still require verification.

#### How information is used - #purpose

The application uses account information to sign customers in and associate their cart, saved wishlist choices, orders and reviews. Delivery information supports fulfilment; order information supports order administration and customer enquiries. Short-lived security request counters help limit abusive login, registration and order submissions. For an approved COD refund, support arranges the necessary bank-transfer details directly with the customer. Never send card numbers, expiry dates or security codes to support.

#### Storage, hosting & service providers - #services

The project uses Supabase PostgreSQL for application records, Render for the backend, Vercel for the website, and Cloudinary for product images. Loading hosted images and pages sends connection requests to those services. Following an external social or WhatsApp link opens that service.

REVIEW REQUIRED — Confirm service operators, processing locations, support access, transfers and relevant contractual arrangements. Do not assume all data stays in Sri Lanka.

#### Payment information - #payments

The updated direct checkout uses cash on delivery and does not ask for card numbers, expiry dates or security codes. No live PayHere integration is active. Future card payments must use an authorised payment provider. Never send card credentials to customer support.

REVIEW REQUIRED — confirm the payment-data policy and review historical records and logs from the earlier simulated payment flow. No card fields were found in the Order database entity; this is not a claim that sensitive information was never collected in the past.

#### Cookies & browser storage - #browser

The reviewed application stores the login token in localStorage. Direct checkout may read an optional saved user profile from localStorage to prefill delivery fields. Signing out removes the local login token; the separate Log out on all devices action also asks the server to invalidate the account’s current sessions. Browser storage can be cleared using browser settings.

Checkout uses this tab’s sessionStorage to remember a random retry key, a fingerprint of the order request and whether its receipt was received. This helps retrieve the same request after an uncertain response. The retry helper does not store raw contact details, addresses, passwords, login tokens or receipts in sessionStorage. Clearing this state can remove retry protection; check My orders or contact support if an order result is unclear.

No application analytics or marketing-cookie integration was identified in the reviewed source. Hosting/provider logging and any additional tracking must be checked before this policy is approved.

#### Retention - #retention

Customer information is kept only as necessary for account management, order fulfilment, legitimate operations and applicable obligations. The owner has approved these targets for technical and legal review: customer-support records 12 months, application logs 30 days and database backups 30 days. Verified account or product-review deletion requests are assessed against applicable obligations; order-record retention is determined by applicable legal and legitimate operational requirements. Where deletion is appropriate, eligible information is removed or anonymized while records that must be retained are preserved. REVIEW REQUIRED — these targets are not verified production retention/deletion controls. The specific applicable order-record period, actual provider/log/backup settings, feasible deletion/anonymization and backup-expiration procedure require review and verification; no automated deletion schedule or legal compliance is claimed.

#### Privacy enquiries & requests - #rights

Send access, correction or deletion requests to support@sekkin.lk. Requests are assigned to an authorized business administrator, who uses proportionate identity checks before disclosing or deleting personal information. Sekkin.lk acknowledges requests and aims to respond within 30 calendar days, subject to applicable legal requirements. Deletion is assessed against applicable retention obligations; the approved process is handled manually, and no self-service or automated deletion feature is claimed. Administrative access is restricted to authorized personnel.

The 30-calendar-day response aim is the approved business process, not a claim that every provision of Sri Lanka’s Personal Data Protection Act is already in force or that the website is certified compliant. Requests are considered under the applicable law and obligations at the time.

#### Policy updates - #updates

The prepared update wording has owner approval. This privacy policy remains a draft until outstanding factual verifications are complete; actual dates are recorded when published.

These policies take effect on the actual public launch date of SEKKIN.LK. Their actual effective date and publication/last-updated date will be displayed on the relevant pages when published. Material changes will be communicated to affected customers where appropriate. No date is backdated or substituted with the earlier business-confirmation or wording-approval date.

### Terms & Conditions - /terms-and-conditions

Read these terms together with the returns, privacy and shipping pages. The prepared terms wording and temporary placeholder product imagery have owner approval; actual policy dates are recorded at public launch and publication.

#### Business & website - #identity

SEKKIN LK is a registered sole proprietorship (business registration 260918038), operating the SEKKIN.LK brand and using the trading name sekkinLK.

The legal seller and responsible sole proprietor is RAVINDU KAUSHAN, carrying on business as SEKKIN LK.

Contact SEKKIN LK at support@sekkin.lk, call or WhatsApp 0740309918, or write to Mahawattha, Batapola, Sri Lanka. Business availability is 24 hours; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, Mahawattha, Batapola, Sri Lanka; follow the return instructions supplied by support.

#### Website use & customer accounts - #accounts

Use the website for lawful shopping and provide accurate account and delivery information. Keep login credentials private. Contact the business if you believe your account has been accessed without permission. Accounts associate shopping carts, orders and product reviews.

#### Product information & availability - #products

Listings display recorded product details, prices and stock. Ingredients, brand or skin-type information appear where supplied. Some current images are temporary illustrative placeholders and may not depict the item supplied; contact support before ordering if the product identity or image is unclear. The owner has approved this temporary presentation and plans to replace it with original product imagery after launch. Current commercial product, price, stock and fulfilment information is owner-confirmed against the reviewed catalog snapshot. No medical benefit or certification is promised.

#### Prices & charges - #prices

Prices are displayed in Sri Lankan rupees (LKR). Cart and checkout display item totals; coupon estimates are confirmed when an order is created.

All prices are in LKR and include applicable taxes. SEKKIN LK is not VAT registered and does not add a separate VAT charge. The fixed LKR 350 normal delivery charge and applicable discounts are displayed in the final total before order confirmation. Any changed price requires the customer's agreement before proceeding. The existing coupon feature remains enabled: GLOW10 and WELCOME10 each reduce the effective merchandise subtotal by 10%; SAVE500 reduces it by LKR 500 when that subtotal is at least LKR 2,500. Enter one coupon code per order; code matching ignores surrounding spaces and letter case. Coupons can apply to already discounted product sale prices and reduce merchandise only, never the delivery charge. Unknown codes or an unmet SAVE500 minimum give no coupon discount. No coupon expiry dates, per-customer/global usage limits, customer/product eligibility restrictions or administrative coupon-management feature are currently configured; none is promised by these terms. The backend validates the configured calculation and confirms the payable total.

#### Orders & confirmation - #orders

Submitting checkout creates an order request and a backend order record. The request is accepted only after the business checks availability and details and communicates acceptance. An acknowledgement or order confirmation is not evidence of payment.

Checkout submission creates an order request. An order is accepted after Sekkin.lk verifies product availability and order details and communicates confirmation to the customer. If a product is unavailable or a pricing error is found before acceptance, Sekkin.lk contacts the customer to explain and offer an appropriate correction, alternative or cancellation. The customer must agree to any changed price before proceeding. The final order total, including delivery and applicable discounts, is displayed before confirmation. An order acknowledgement or confirmation is not proof of payment.

#### Payment methods - #payments

Cash on Delivery is supported. Online card and KOKO payments are unavailable. PayHere application and merchant approval are pending.

Cash on Delivery (COD) is the current payment method. The courier collects the confirmed order amount on delivery, and courier settlement reports are available. Authorized administrators must review actual courier settlement evidence before recording COD as collected in the audited workflow. Dispatch, delivery and failed collection do not themselves prove payment or mark an order paid. Prices use LKR. PayHere application and merchant approval remain pending; PayHere, KOKO and all online card payments remain disabled. An order acknowledgement or confirmation is not proof of payment.

#### Shipping & delivery - #delivery

Delivery is islandwide in Sri Lanka through Koombiyo Delivery Company, with an estimated two to three business days after order confirmation. Orders are normally dispatched within one business day after confirmation, subject to stock. Business days exclude Saturdays, Sundays and Sri Lankan public holidays. A fixed LKR 350 delivery charge applies to every normal order and is displayed before confirmation. The courier arrangement has three delivery attempts and no fee for an unsuccessful attempt itself. A separate LKR 500 returned-parcel charge can apply for customer-responsibility returns, with wrong/damaged/faulty exceptions and no duplicate charge for the same parcel. Read the Shipping & Delivery and Refund & Return policies for the exact conditions.

#### Cancellations, returns & refunds - #returns

Return and exchange requests can be made within seven days of receiving an order. Ordinary change-of-mind returns/exchanges require unused, unopened products in original sealed packaging; those restrictions do not exclude remedies for wrong, damaged or faulty goods. Customers can request cancellation before dispatch; cancellation is confirmed when Sekkin.lk sends confirmation. Read the Refund & Return Policy for authorization, inspection, bank-transfer refunds, exchanges and shipping responsibilities.

#### Intellectual property - #ownership

The business owner has authorized use of the existing website logo, existing product photographs and existing supplier descriptions. Third-party brand and content rights remain with their respective rights holders; authorization is not a claim that SEKKIN LK owns third-party brands. Do not copy or reuse protected website assets beyond applicable permission or law. This authorization covers the current reviewed assets and does not automatically extend to newly added material.

#### Liability & customer rights - #liability

SEKKIN LK remains responsible for obligations and remedies that cannot lawfully be excluded. Delivery estimates are estimates and do not remove the duty to address unreasonable delay or an unfulfilled order. Nothing in these terms excludes liability or customer remedies where exclusion would be unlawful, including applicable rights concerning wrong, damaged, faulty or unsafe goods. No blanket exclusion, exclusive remedy, forced arbitration or waiver of access to competent authorities or courts is imposed.

#### Support & complaints - #complaints

Send your order number and a description of the complaint to support@sekkin.lk or call or WhatsApp 0740309918. Written complaints may also be sent to Mahawattha, Batapola, Sri Lanka. Sekkin.lk aims to acknowledge complaints within two business days and provide a resolution or progress update within seven business days. Unresolved complaints are escalated to the responsible business owner or authorized manager. These are response aims, not a guarantee of immediate or round-the-clock staffed support. Applicable customer rights are preserved.

Contact SEKKIN LK at support@sekkin.lk, call or WhatsApp 0740309918, or write to Mahawattha, Batapola, Sri Lanka. Business availability is 24 hours; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, Mahawattha, Batapola, Sri Lanka; follow the return instructions supplied by support.

#### Governing law - #law

These terms and purchases are governed by applicable Sri Lankan law. Contact support first if you would like the business to try to resolve a concern, but the internal complaint process does not prevent you from contacting the Consumer Affairs Authority, another competent regulator or a court with lawful jurisdiction. No exclusive foreign forum, compulsory arbitration or restriction of applicable mandatory consumer rights is imposed.

#### Updates - #changes

These policies take effect on the actual public launch date of SEKKIN.LK. Their actual effective date and publication/last-updated date will be displayed on the relevant pages when published. Material changes will be communicated to affected customers where appropriate. No date is backdated or substituted with the earlier business-confirmation or wording-approval date.

### Shipping & Delivery - /shipping-policy

Islandwide delivery across Sri Lanka with Koombiyo Delivery. Delivery is estimated within two to three business days after order confirmation; a fixed LKR 350 delivery charge applies to every order. Orders are normally dispatched within one business day after confirmation, subject to stock. Business days exclude Saturdays, Sundays and Sri Lankan public holidays. Delivery dates are estimates.

#### Delivery coverage - #coverage

We deliver products islandwide across Sri Lanka.

#### Order processing - #processing

Orders are normally processed and dispatched within one business day after confirmation, subject to stock availability. Business days exclude Saturdays, Sundays and Sri Lankan public holidays.

#### Estimated delivery periods - #timelines

Delivery is estimated within 2–3 business days after order confirmation. Business days exclude Saturdays, Sundays and Sri Lankan public holidays. This is an estimate, not a guaranteed delivery date; courier delays and circumstances outside the business's reasonable control may affect delivery.

#### Delivery charges - #charges

A fixed delivery charge of LKR 350 applies to every order. The delivery charge is displayed at checkout before you confirm your order.

#### Delivery partners - #partners

Koombiyo Delivery Company is the delivery partner confirmed by the business owner. No courier API or automated tracking integration is claimed.

#### Tracking & updates - #tracking

My orders shows recorded order status. It is not a courier-tracking integration.

When the courier supplies a tracking reference, Sekkin.lk shares it manually through an available customer contact channel: WhatsApp, SMS or email. Tracking information is conditional on the courier providing it. My orders displays recorded order status, not live courier tracking; this website does not claim automated tracking, email or SMS integration.

#### Delays - #delays

Sekkin.lk informs customers through their supplied contact channel when significant delivery delays become known. Customers may contact support@sekkin.lk or 0740309918 about a delayed delivery.

#### Failed deliveries - #failed-delivery

The confirmed courier arrangement allows three delivery attempts. Customers must provide an accurate delivery address and reachable phone number. A failed delivery attempt itself has a LKR 0 charge. If delivery fails, SEKKIN LK contacts the customer to confirm details and arrange the next available delivery; if the parcel has returned to the business, the customer is contacted before another shipment is arranged. The customer pays the LKR 500 courier return charge when a parcel is returned due to customer responsibility: an incorrect address, repeated unavailability after the delivery attempts, refusal of a correctly supplied order or an ordinary change-of-mind return where the charge applies. SEKKIN LK covers the applicable return delivery charge for wrong, damaged or faulty goods; applicable mandatory consumer rights are preserved. The return charge is disclosed before requiring payment, applies only once to the same applicable returned parcel, and is separate from the normal LKR 350 per-order delivery charge. LKR 500 is not added to normal checkout or charged for an attempt alone. Any additional reshipment charge must be communicated and accepted before another shipment is arranged. Customer contact and courier handling are manual; no automated returned-parcel, fee collection or redelivery integration is claimed.

#### Delivery questions - #support

Contact SEKKIN LK at support@sekkin.lk, call or WhatsApp 0740309918, or write to Mahawattha, Batapola, Sri Lanka. Business availability is 24 hours; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, Mahawattha, Batapola, Sri Lanka; follow the return instructions supplied by support.

### About SEKKIN.LK - /about

Beauty for your everyday. A place to explore cosmetics and skincare and choose what belongs in your routine.

#### A place for your daily favourites - #brand

SEKKIN LK is a registered sole proprietorship (business registration 260918038), operating the SEKKIN.LK brand and using the trading name sekkinLK.

The business is an online retailer of cosmetics, skincare and beauty products for customers in Sri Lanka. It is a sole proprietorship, not a partnership or limited company.

#### Explore with the details in view - #shopping

Browse product information, ingredients where provided, current prices and recorded availability. Save items to your cart, review the order summary and view your orders through your account.

#### Clear information, thoughtful care - #care

The Contact, Shipping, Returns, Privacy and Terms pages bring customer information together. Prepared policy wording and the temporary catalog presentation have owner approval; policies remain drafts until outstanding hosting, retention and security verifications are complete.

#### Business information - #business

SEKKIN LK is a registered sole proprietorship (business registration 260918038), operating the SEKKIN.LK brand and using the trading name sekkinLK.

The legal seller and responsible sole proprietor is RAVINDU KAUSHAN, carrying on business as SEKKIN LK.

Contact SEKKIN LK at support@sekkin.lk, call or WhatsApp 0740309918, or write to Mahawattha, Batapola, Sri Lanka. Business availability is 24 hours; no immediate or round-the-clock staffed support response is guaranteed. Returns must be authorized before products are sent to the approved return destination, Mahawattha, Batapola, Sri Lanka; follow the return instructions supplied by support.

### Contact us - /contact

Questions about a product, delivery or an order? Email, call or WhatsApp using the confirmed contact details below. Business availability is 24 hours; a support response time is not guaranteed.

#### Help with an order - #orders

Contact support@sekkin.lk or 0740309918 with your order details and a short description of the issue. Include clear photographs when reporting wrong, damaged or faulty goods. Do not send your password, full card number, expiry date or security code.

#### Availability & business identity - #availability

SEKKIN LK is a registered sole proprietorship (business registration 260918038), operating the SEKKIN.LK brand and using the trading name sekkinLK.

Business availability is 24 hours. This is not a guarantee of an immediate or round-the-clock staffed support response.

The legal seller and responsible sole proprietor is RAVINDU KAUSHAN, carrying on business as SEKKIN LK.

#### Find your information - #policies

You can read the shipping, return, privacy and website terms from the links on this page. No contact form is shown because no submission service is configured.

## Approval and release limits

The owner's supplied business/asset/catalog confirmations, exact wording approval and subsequent temporary-image acceptance are recorded in [OWNER_APPROVAL_RECORD.md](OWNER_APPROVAL_RECORD.md). contactsConfirmed and catalogReviewed are true for their recorded scopes. Full factual policiesApproved and paymentSafetyReviewed remain false. No corrected/original product-image or deployed technical result is invented.

Actual effective/publication dates remain unset. No production credential, database record, inventory amount or deployment is changed by this package. Do not bypass the readiness checker or present incomplete factual disclosures as finalized. Use [RENDER_SECURITY_RUNBOOK.md](RENDER_SECURITY_RUNBOOK.md) and the coordinating release report for actual isolated verification, secret containment/rotation, schema/runtime review, ordering pause and matching Render/Vercel release steps. Production changes, pushes, merges and deployments require separate authorization.
