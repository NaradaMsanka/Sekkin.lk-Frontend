# Operational procedure approval record

**Current status:** later business/proprietor confirmations, exact consolidated wording approval and explicit temporary-catalog acceptance below supersede earlier pending decisions. Contacts and the documented temporary catalog review are approved. Prepared wording version abe2b807 is owner-approved; the effective-date basis is the actual public launch. Actual effective/publication calendar dates remain unset; full factual policy/security sign-offs remain independently gated. Initial records below are history.

Recorded 16 November 2026 (Asia/Colombo). The owner supplied **“SEKKIN.LK — Remaining Business Decisions and Production Release Preparation”** and explicitly replied **“i approved all things in here”**. This approves the proposed operational procedures in that attachment. It does not supply facts the attachment itself marks UNDECIDED, establish external courier/provider capabilities, approve an unreviewed catalog, or establish that a technical control is implemented or deployed.

This record is an operational approval record, not a policy effective date, publication date, legal opinion or deployment authorization. `policyEffectiveDate` and `policyApprovedDate` remain null. All four readiness approval flags remain false. Nothing in this record authorizes pushing, merging, deployment or changes to production records.

## Approved procedures applied

| Area | Approved procedure | Configuration source |
| --- | --- | --- |
| Return authorization and destination | Email/WhatsApp request with order number, product details, reason and relevant photos; wait for authorization and instructions; return destination Mahawattha, Batapola, Sri Lanka. | `src/content/business.json`: `refund.requestProcedure` |
| Inspection and review | Inspect within two business days of receipt, notify through the supplied contact channel, explain rejection and allow further review; wrong/damaged/faulty complaints are handled separately from ordinary change-of-mind returns. | `refund.damagedItems`, `refund.requestProcedure`, `refund.refundMethod` |
| COD refunds | Bank transfer arranged directly with the customer; approved refunds processed within seven business days after inspection completion and approval. No bank or card details are recorded in this document. | `refund.refundMethod`, `refund.refundTimeline` |
| Cancellations and exchanges | Cancellation requests include order number and are confirmed by a business confirmation; approved exchanges processed within two business days after receipt and inspection, subject to stock; lower-priced replacement difference refunded by the approved method. | `refund.cancellations`, `refund.exchanges` |
| Dispatch and estimate | Normally dispatch within one business day after confirmation, subject to stock; estimated delivery two to three business days after confirmation; Saturdays, Sundays and Sri Lankan public holidays excluded; estimates are not guarantees. | `shipping.processing`, `shipping.deliveryEstimate` |
| Conditional manual tracking and delays | Manually share a courier reference when supplied, using an available WhatsApp/SMS/email contact channel; notify significant known delays. No automated tracking or messaging integration is claimed. | `shipping.tracking`, `shipping.delays` |
| Failed deliveries | Confirm contact/address details after a failed attempt, contact the customer before reshipping returned parcels, and disclose and obtain agreement to any additional charge first. Actual courier attempt limits, availability and charges remain unverified. | `shipping.failedDelivery` remains partial |
| Order acceptance and price errors | Checkout is an order request; acceptance follows stock/detail checks and communicated confirmation; explain pre-acceptance stock/price errors and obtain agreement to a changed price. | `terms.orderAcceptance`, partial `terms.pricesAndTaxes` |
| COD handling principles | Collect the confirmed amount on delivery; only authorized verification of actual collection can mark payment paid; failed collection cannot do so. Actual courier evidence/settlement and implementation still require verification. | `terms.paymentMethods` remains partial |
| Privacy requests | Support-email access/correction/deletion requests handled by an authorized administrator with proportionate identity checks; acknowledge and aim to respond within 30 calendar days subject to law. No automated deletion is claimed. | `privacy.rightsProcedure` |
| Retention principles | Retain only as necessary; remove/anonymize eligible information when appropriate while preserving required records. Specific periods and deletion/backup implementation remain unresolved. | `privacy.retention` remains partial |
| Complaints | Order number and description through the confirmed channels; aim to acknowledge within two business days and resolve or update within seven; escalate unresolved issues to the owner/authorized manager. | `terms.complaints` |
| Policy changes | Publish updates on the relevant pages, show actual effective/updated dates and communicate material changes where appropriate. Dates and completed legal/policy approval remain unresolved. | `terms.updates` remains partial |

The previously approved business contacts, COD, fixed LKR 350 per-order delivery, islandwide coverage, seven-day conditions, cancellation rules and pending PayHere status remain unchanged. Brand `Sekkin.lk` and trading name `sekkinLK` remain distinct from the unknown legal seller.

## Not established by this approval

- Legal seller/type/registration details and legal controller identity.
- Tax registration/inclusive pricing and the actual coupon commercial terms and supported controls.
- Courier attempt limits, failed-delivery/return charges, actual tracking channels available for a shipment, or proof of sustained dispatch performance.
- Specific retention periods, deletion/backup expiration, actual provider-account processing regions and access/transfer arrangements.
- Product/brand/image/description usage rights, appropriately reviewed consumer-rights/liability/governing-law/dispute provisions, final policy dates and complete policy approval.
- Genuine SKU/variant/description/claim/image/price/stock/fulfilment review.
- Completed security controls, credential rotation, a verified deployed revision, hosted integration, or any of the four full readiness sign-offs.

The concise [remaining questionnaire](PAYHERE_BUSINESS_QUESTIONNAIRE.md) asks only for missing decisions. The live checker and source map remain authoritative for the current count.

## Later record: final business confirmations, 16 November 2026

Source: the owner's supplied **“SEKKIN.LK — FINAL BUSINESS APPROVAL AND PRODUCTION COMPLETION”** attachment. This supplies actual registration, tax, courier, COD and current-asset confirmations in addition to the earlier approved procedures. These facts supersede the corresponding unknown entries above; technical, legal, catalog-version and publication evidence are evaluated separately.

- Registered business name **SEKKIN LK**; status **Registered**; **Sole Proprietorship**, registration **260918038**. Brand **SEKKIN.LK** and trading name **sekkinLK**. It is not described as a limited company or partnership. The business-owner confirmation is recorded; no independent registry search result or identity document is claimed.
- Existing address, email, phone/WhatsApp and 24-hour business availability are reaffirmed. The implementation exposes `mailto:support@sekkin.lk`, `tel:+94740309918` and `https://wa.me/94740309918` consistently. `contactsConfirmed` is true based on the supplied registration/contact facts and reviewed shared contact links; the separate personal seller/controller identity still remains explicit in the final package. This flag does not approve policies, security or catalog.
- **Not VAT registered**; displayed product prices include applicable taxes; no separate VAT addition. LKR 350 normal per-order delivery and backend-authoritative/stored historical totals are preserved.
- Existing coupons remain enabled with their actual code behavior: GLOW10/WELCOME10 10% off effective merchandise subtotal; SAVE500 LKR 500 off when that subtotal is at least LKR 2,500. One coupon string per order; whitespace/case normalized; product sale prices can combine with a coupon; no expiry/usage/customer/product restrictions or coupon-management interface are configured. No unsupported control or new code is introduced.
- Courier **Koombiyo Delivery Company**, **three attempts**, **LKR 0 failed-attempt charge**, and **LKR 500 returned-parcel charge** confirmed by the owner. The customer pays the latter only for applicable customer-responsibility returns (wrong address, repeated unavailability, refusing correctly supplied goods or ordinary change of mind where applicable). Business pays for wrong/damaged/faulty goods. The charge is disclosed first, separate from normal delivery, never added to every checkout, and never applied twice to the same applicable returned parcel. No automated returned-parcel or collection functionality is claimed.
- Courier collects COD and settlement reports are available. Authorized administrators must inspect actual settlement evidence before recording collection; dispatch/delivery/failed collection do not imply PAID. The local audited workflow and hosted verification remain separate evidence.
- **Current** website logo, existing product photos and supplier descriptions are authorized by the owner; approval does not automatically cover future assets or establish ownership of third-party brands. Owner approval of current product prices, stock and fulfilment is bound to the read-only catalog snapshot in [the catalog review](CATALOG_APPROVAL_REVIEW.md). Material image-relevance/missing-image discrepancies still prevent `catalogReviewed`: authorization is different from an accurate product image, and no production record has been corrected.
- Support **12 months**, application logs **30 days** and backups **30 days** are accepted **for technical/legal review**, expressly not asserted as implemented controls. Account/review deletion requests and applicable order-record obligations remain subject to verified procedures. Actual regions/provider access/retention settings cannot be inferred from this approval.
- Prepared consumer/remedy/liability/governing-law wording is supplied for one consolidated final policy review. No independent legal opinion, compliance certification, effective date or publication event is invented. `policiesApproved`, `catalogReviewed` and `paymentSafetyReviewed` remain false.

The [single final policy package](FINAL_POLICY_REVIEW_PACKAGE.md) contains the prepared rendered text, the specific unresolved facts/disclosures and the sole consolidated approval step. The former questionnaire now points there instead of asking the confirmed business decisions again. No secret, production data, push/merge, deployment or production credential rotation is performed or authorized by this record.

## Subsequent proprietor confirmation

The authorized business owner answered the single missing-name request with **RAVINDU KAUSHAN**. This name is now recorded as the legal seller/sole proprietor carrying on business as **SEKKIN LK**, and as the responsible data controller in the policy configuration. This owner-supplied confirmation supersedes the earlier missing-name notes; no private document or inference from an IDE account was used. It does not establish a policy publication date, provider region, implemented retention control, corrected catalog image or deployed security state. Other confirmed information is not being requested again.

## Consolidated policy wording approval — 16 November 2026

The authorized owner explicitly approved `docs/FINAL_POLICY_REVIEW_PACKAGE.md` **version abe2b807** as one consolidated wording package, including consumer remedies, liability, Sri Lankan governing law and dispute resolution, and reaffirmed **RAVINDU KAUSHAN** as the legal owner. The exact full source version is **abe2b80743126ab944c021e860b0a1f83ae220312b98642e629b617a4f0cf69b**; its original business/page bytes were reconstructed and the hash verified before recording approval. [The archived evidence](release-verification/approved-policy-wording.json) preserves those bytes.

The owner selected **the actual public launch date of SEKKIN.LK** as the intended effective date. `policyEffectiveDateBasis` records this decision; `policyEffectiveDate` and `policyPublicationDate` remain null until the actual launch/publication. `policyWordingApproval.recordedDate` records this wording approval only. The full `policyApprovedDate` remains null because outstanding factual disclosures prevent the complete policy sign-off. No publication is backdated or inferred from any operational approval.

Only satisfied wording markers are cleared: `refund.consumerRights`, `terms.liability`, `terms.governingLaw`, `terms.updates` and their four corresponding rendered sections. Actual provider-region/retention/historical-payment/corrected-catalog requirements remain explicit. Source-verified wishlist/short-lived hashed abuse-counter disclosures added after the approved baseline are identified separately; no commercial or approved consumer/liability/law clause was silently changed.

The owner expressly requires full policy, catalog and security flags only after genuine completion and keeps live PayHere/card payments disabled. This approval does not authorize automatic push, merge, deployment, credential rotation or production catalog edits. No repeat consolidated wording approval or general business questionnaire is needed.

## Subsequent acceptance of temporary catalog imagery

After receiving the specific ID 1/2/3 findings, the owner expressly stated that the images are dummy images, will be replaced with original product material after deployment, and must not be treated as a current release issue. This is knowing acceptance of the inspected temporary presentation, not a statement that the event/illustrative images depict the offered cosmetic.

`catalogReviewed=true` now records the **completed read-only review plus this explicit owner-approved temporary scope**, tied to snapshot **d1060526b7eabb001e676d21ec6644bbef575ce487a73d779f38269b1cc36115**. `catalogReviewApproval.actualProductPhotographyVerified=false` remains explicit. Existing owner price/stock/fulfilment and current-asset permissions are preserved. Terms disclose temporary illustrative imagery and advise contacting support if product identity is unclear. No product, price, stock or image record was changed in Production.

Original-image/listing replacement is a post-launch follow-up under the owner's latest instruction, rather than a remaining blocker. Later new assets/catalog records need their own accurate review; this temporary approval is not silently extended to them. `policiesApproved` and `paymentSafetyReviewed` remain false for actual privacy/retention/hosted-security requirements. The strict checker is unchanged.
