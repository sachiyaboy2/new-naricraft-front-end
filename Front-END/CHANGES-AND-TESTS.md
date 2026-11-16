# Nari Craft repair report — 2026-11-15

## Comparison

Inputs: `Old-nari craft.zip` and `New-nari craft.zip` in the supplied local folder. Both were extracted into a separate working copy. The user's original files were not overwritten.

The two input archives contain identical backend controllers, models, routes and `index.js`. Backend differences are the environment example, lockfile and removal of the separate Payments.lk environment example. The new archive contains the major frontend design changes, theme/animation components and updated pages. The new visual design is retained.

The old environment template was stale: its Gmail/PayHere entries did not match the Resend/Payments.lk implementation already present in both versions.

## Fixes included

### Configuration and startup

- Corrected the frontend API example from port 5050 to backend port 5000.
- Centralized API URL normalization and a working localhost fallback across frontend requests.
- Load dotenv before imported modules initialize, including the Google client.
- Removed the global hard-coded DNS server override.
- Backend `npm start` now runs Node directly; `npm run dev` runs nodemon.
- Backend connects to MongoDB before accepting requests; health returns 503 when disconnected. Database outages return a clear API response.
- Malformed JSON/body-too-large responses use 400/413 instead of a generic 500.
- Added `npm run setup`, which creates a new `.env` with a random JWT secret without overwriting an existing file.

### Frontend

- Missing Supabase configuration no longer crashes the application at module import. Uploads explain the missing configuration when used.
- Uploads validate common image formats and a 5 MB maximum and use collision-resistant names.
- Missing Google client ID no longer mounts the Google provider/button. Normal password login remains available.
- Checkout retries reuse an order only when its cart/customer/delivery details still match, rather than silently reusing an outdated order after form edits.
- Pages load in separate chunks. The previous approximately 948 kB initial JavaScript bundle was reduced to approximately 276 kB in the blank-optional-config build. Production build no longer emits the earlier large-chunk warning.

### Backend behavior

- Requests carrying valid JWTs re-check the current database user, role and blocked state. A previously issued admin token cannot bypass a subsequent role/block change.
- A wrong OTP no longer deletes the valid code immediately. OTPs are hashed; five failed attempts require a new code; successful reset atomically claims the OTP. Existing short-lived plain-code records are accepted during migration.
- Missing email/Google configuration has an explicit service-unavailable response.
- New product/custom order IDs are collision-resistant instead of using a race-prone last-record increment. Existing IDs remain valid.
- Duplicate product rows cannot bypass a per-product quantity check.
- Negative prices and negative/fractional stock fail validation. Updates run validators, preserve product IDs, and return 404 for missing products; duplicate IDs return 409.
- Product stock reservation and order creation share a MongoDB transaction. Cancellation restores reserved stock once; cancelled orders cannot be reopened. Legacy orders have no retroactive stock adjustment.
- Payments require both checkout and webhook configuration.
- Delayed checkout state writes and failed callbacks cannot overwrite Paid/Partially Paid/Chargedback order states.
- Verified payment application records its reference, uses conditional state updates and allows recovery if the order was saved but the payment record write failed. Conflicting payments/changed order totals require reconciliation rather than overwriting the paid amount.

## Verification

- Frontend ESLint: passed, zero errors/warnings.
- Frontend production build: passed with optional services blank; additionally compiled with non-secret example Google/Supabase settings.
- Backend JavaScript syntax checks: passed.
- Backend regression suite: 17 tests passed. Uses real Express middleware and real Payments.lk HMAC verification; database operations are mocked. No real payment/email was sent.
- Existing local dependency versions matched the supplied new package-lock files for direct dependencies. Tests used Node.js 22.22.0. Dependencies were reused locally because external network access was restricted; a fresh network `npm ci` was not independently executed here.

Coverage: health/CORS/body parsing/JWT rejection; blocked users; OTP mistakes and attempt limits; configuration errors; duplicate product input; model validation; missing-product updates; webhook signatures/amount verification/success/replay/repair; transaction/session stock calls, stock-race rejection and one-time cancellation restore.

## Limits and deployment notes

- Browser UI and real HTTP socket checks were blocked by this environment (loopback connection EACCES/browser timeout). The suite exercises Express in-process. No visual browser QA or full end-to-end pass is claimed.
- Live MongoDB transactions, credentials/network allowlists, Google origins, Resend sender verification, Supabase storage permissions and provider callbacks still require the live checklist in `SETUP-SINHALA.md`.
- Product ordering requires MongoDB Atlas or a local replica set. A standalone local MongoDB is insufficient for transactions. Stock remains reserved on unpaid/abandoned orders until an admin cancels them. Refunds are not automatically issued on cancellation.
- A second actual charge from a different payment attempt is a reconciliation/refund case; the code protects order state but does not automatically refund the charge. Provider dashboard reconciliation is still necessary.
- Product half-payment orders now have an admin balance-collection endpoint and a confirmation button in Web Orders → Details. This records an already received payment; it does not charge a card. The endpoint checks admin access and conditionally updates the pending balance.
- Public image uploads retain the original Supabase integration model. Nari Craft's JWT is not a Supabase Auth session; configure the bucket policy appropriately, and use an authenticated/signed-upload design for production controls.
- New archives contain source, lockfiles, tests, environment examples and guides. They omit node_modules, build output, git metadata and private `.env` secrets.

These checks establish the listed fixes, not a guarantee of zero possible errors in every deployment.
