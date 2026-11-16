# Nari Craft — setup සහ .env විස්තර

මෙම guide එක backend සහ frontend ZIP දෙකේම තිබේ. අලුත් design එක තබාගෙන code fixes කර ඇත. ඔබගේ original folder එක වෙනස් කර නැත. පුද්ගලික passwords/API secrets ZIP වල ඇතුළත් කර නැත.

## ඉක්මනින් run කරන ආකාරය

1. ZIP දෙක වෙන වෙනම extract කරන්න. Node.js 22.22.0 භාවිතයෙන් මෙය build/test කළා.
2. `Back-END` folder එකේ terminal එකක් විවෘත කර `npm ci` කරන්න.
3. පරණ working `.env` එක අලුත් `Back-END` folder එකට copy කර පහත settings සකස් කරන්න. `.env` එකක් නැත්නම් `npm run setup` කරන්න. එය random JWT secret එකක් සහිත `.env` සාදයි; තිබෙන `.env` overwrite නොකරයි.
4. නිවැරදි `MONGO_URI` එක යොදන්න. Example එකේ local MongoDB address එක ක්‍රියාකරන්නේ ඔබ local MongoDB install/run කර තිබුණොත් පමණි. Atlas භාවිතා කරනවා නම් ඔබගේ existing connection string එකම තබන්න.
5. `npm run dev` (development) හෝ `npm start` (normal server) කරන්න. MongoDB connect වූ පසුව පමණක් HTTP server එක ready වෙයි.
6. `Front-END` folder එකේ වෙනත් terminal එකක් විවෘත කර `npm ci` කරන්න.
7. ඔබගේ frontend `.env` එක copy කර පහත values සකස් කරන්න. නැත්නම් PowerShell තුළ `Copy-Item .env.example .env` කරන්න.
8. `npm run dev` කර terminal එකේ පෙන්වන URL එක open කරන්න. සාමාන්‍ය URL එක `http://localhost:5173`.

`.env` වෙනස් කළ සෑම අවස්ථාවකම අදාල server එක restart කරන්න. Production frontend එකට values වෙනස් කළ විට නැවත `npm run build` කරන්න.

## Backend .env

| Variable | දාන්න ඕනෑ value | අවශ්‍ය වන්නේ |
|---|---|---|
| `PORT` | Local development සඳහා `5000`. Host එක ලබාදෙන PORT එක production වල භාවිතා කරන්න. | Backend port |
| `MONGO_URI` | ඔබගේ MongoDB Atlas connection string; database user/password ඇතුළත් විය යුතුයි. | සියලු database වැඩ |
| `JWT_SECRET` | අවම අක්ෂර 32ක් ඇති random secret. Existing secret එක තබාගත හැක. `npm run setup` අලුත් `.env` සඳහා මෙය generate කරයි. | Login tokens |
| `FRONTEND_URL` | Local: `http://localhost:5173`; deployed app සඳහා එහි HTTPS base URL. | Payment return URLs සහ CORS fallback |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:5174`; production frontend origin එක අවශ්‍ය නම් comma එකකින් එකතු කරන්න. `/login` වැනි path එකක් යොදන්න එපා. | Browser එකට API access |
| `GOOGLE_CLIENT_ID` | Google OAuth Web application Client ID. Existing backend value එකම frontend `VITE_GOOGLE_CLIENT_ID` එකටත් දාන්න. | Google login පමණි |
| `RESEND_API_KEY` | Resend dashboard → API Keys වෙතින් ලබාගන්නා sending API key. Gmail password එකක් නොවේ. | Forgot-password OTP email |
| `RESEND_FROM_EMAIL` | Resend තුළ verify කර ඇති ඔබේ domain එකේ sender. උදාහරණයක්: `Nari Craft <orders@your-real-domain.lk>`. මෙහි sample domain එක ඇත්ත value එකක් නොවේ. | Email sender |
| `PAYMENTS_LK_SECRET_KEY` | ඔබගේ Payments.lk server secret key. මුලින් sandbox/test key භාවිතා කරන්න. | Online checkout |
| `PAYMENTS_LK_WEBHOOK_SECRET` | Payments.lk webhook endpoint එක සඳහා ලබාදෙන signing secret. API secret key එකට වෙනස් value එකකි. | Verified payment callbacks |

**ඔබගේ local files වල හමු වූ දේ:** backend `RESEND_API_KEY` සහ `RESEND_FROM_EMAIL` හිස්/example values විය. Frontend `.env` තුළ `VITE_GOOGLE_CLIENT_ID` නොතිබුණි. අනිත් keys තිබුණත් ඒවායේ validity/live connectivity මෙම පරීක්ෂාවෙන් තහවුරු කර නැත.

### Resend email සකස් කිරීම

- Resend dashboard එකේ API key එකක් create කර `RESEND_API_KEY` යටතේ දාන්න. Sending access ඇති key එක ප්‍රමාණවත්.
- ඔබට අයිති domain එක verify කර එහි sender address එක `RESEND_FROM_EMAIL` යටතේ දාන්න. `orders@example.com` එහෙමම තබන්න එපා.
- පරණ `EMAIL_USER` සහ `APP_PASSWORD` මේ code එකේ භාවිතා නොවේ. ඒවා පිරවීමෙන් Resend OTP වැඩ කරන්නේ නැත.
- Email settings නැතිව සාමාන්‍ය registration/login ක්‍රියා කළ හැක; password-reset email සඳහා ඒ settings අවශ්‍යයි.

### Payments.lk සකස් කිරීම

Webhook endpoint: `https://YOUR-BACKEND/api/payments/payments-lk/webhook`

මෙහි YOUR-BACKEND වෙනුවට ඔබගේ public HTTPS backend hostname යොදන්න. Provider එකට ඔබගේ laptop එකේ `localhost` URL එකට callback යැවිය නොහැක. Public test deployment/tunnel එකක් අවශ්‍යයි. Dashboard webhook configuration එකේ `payment.succeeded` සහ `payment.failed` events සකස් කර අදාල signing secret එක `.env` වෙත දාන්න.

`FRONTEND_URL` යනු backend URL එක නොවේ. Payment return page එක open වීම පමණින් payment එක verified වෙන්නේ නැත. Signed webhook එක order එක update කළ යුතුය. Secret key සහ webhook secret දෙකම නැතිනම් checkout ආරම්භ නොකරයි.

පරණ `PAYHERE_MODE`, `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, `BACKEND_PUBLIC_URL` මේ implementation එකේ read නොකරයි. ඒවා Payments.lk keys වෙනුවට යොදන්න එපා. Legacy database field names කිහිපයක `payhere` වචනය තිබීමෙන් PayHere integration එකක් ක්‍රියාත්මක වෙන්නේ නැත.

## Frontend .env

```dotenv
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_CLIENT_ID=
```

| Variable | දාන්න ඕනෑ value |
|---|---|
| `VITE_API_URL` | Backend base URL. `/api` අවසානයට එකතු කරන්න එපා. මේ code එකම `/api/...` එකතු කරයි. |
| `VITE_SUPABASE_URL` | ඔබගේ Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | ඔබගේ Supabase browser-safe anon/publishable key. **Service-role/secret key එක මෙතැන යොදන්න එපා.** |
| `VITE_GOOGLE_CLIENT_ID` | Backend `GOOGLE_CLIENT_ID` එකේ value එකම. |

`VITE_API_URL2` මේ project එක භාවිතා නොකරයි. එහි URL එක වෙනස් කළත් app එක භාවිතා කරන්නේ `VITE_API_URL` පමණි.

Google Cloud OAuth Web client එකේ Authorized JavaScript origins වල ඔබ භාවිතා කරන frontend origin(s) දාන්න. Google settings හිස් නම් normal email/password login තවම පවතී; Google button එක නොපෙන්වයි.

Supabase upload utility එක `images` bucket එක භාවිතා කරයි. Public image URLs පෙන්වීමට bucket එකේ access model සහ upload INSERT policy නිවැරදි විය යුතුයි. Nari Craft JWT login එක Supabase Auth session එකක් **නොවේ**; `authenticated` role සඳහා පමණක් ඇති policy එකකින් මෙම existing upload flow එකට අවසර ලැබෙන්නේ නැත. Existing policy බලන්න; production සඳහා authenticated upload/signed-upload design එකක් සකස් කරගන්න. Public bucket එකක් කිරීමෙන් upload permission ස්වයංක්‍රීයව ලැබෙන්නේ නැත. Bucket-level allowed MIME types සහ 5 MB file limit එකත් සකස් කරන්න.

Secret values frontend `VITE_` variables වලට දාන්න එපා; ඒවා browser bundle එකට ඇතුළත් වේ.

## පරීක්ෂණ සහ production පරීක්ෂාව

Backend: `npm test` — isolated regression tests; real MongoDB/payment/email requests යවන්නේ නැත.

Frontend: `npm run lint`, `npm run build`.

Live setup එකේ ඔබ පරීක්ෂා කළ යුතු දේ:

1. `/health` response එක HTTP 200 සහ database connected වීම.
2. Test user registration → login → logout → login; admin role access සහ blocked user access.
3. Google login; Resend OTP ලැබීම; වැරදි OTP → නිවැරදි OTP → password reset.
4. Image upload, product add/update, cart quantity, checkout customer/delivery details.
5. Payments.lk sandbox full/half payment, cancelled/failed payment, webhook retry සහ order status.
6. Custom order measurements, price setting සහ balance collection. Product half-payment සඳහා Admin → Web Orders → Details → Record received balance භාවිතා කරන්න; මුදල් ඇත්තටම ලැබුණු පසුව පමණක් confirm කරන්න. මේ button එක card charge එකක් නොකරයි.
7. Concurrent ordering, refunds, provider timeouts සහ duplicate payment attempts production launch එකට පෙර වෙනම integration test කරන්න.

**Stock reservation:** නව product order එක create කරන විට stock අඩු කර order එක save කිරීම එක MongoDB transaction එකකින් සිදු වේ. Admin order එක Cancelled කළ විට reserve කළ stock එක එක් වරක් පමණක් ආපසු එකතු වේ. Cancelled order එක reopen නොකර අලුත් order එකක් create කරන්න. Payment අසාර්ථක/abandoned orders වල stock admin cancel කරන තෙක් reserve වී පවතී. Cancel කිරීමෙන් payment refund එකක් ස්වයංක්‍රීයව සිදු නොවේ. පරණ orders වල stock නැවත අඩු නොකරයි.

**Database requirement:** Order transactions සඳහා MongoDB Atlas හෝ replica set එකක් ලෙස configure කළ local MongoDB අවශ්‍යයි. Standalone local MongoDB එකක catalog/login තිබුණත් ordering සඳහා replica set අවශ්‍ය බව API එක පැහැදිලි කරයි. Default local MONGO_URI එක භාවිතා කරනවා නම් local server එක ඒ අනුව configure කරන්න; Atlas භාවිතා කරනවා නම් existing Atlas URI එක තබන්න.

මේ පරිසරයෙන් local network/browser සහ external services සම්බන්ධ කළ නොහැකි නිසා live end-to-end verification කර නැත. Build/test pass වීමෙන් සෑම runtime/service configuration එකක්ම error-free බවට සහතික නොවේ.

## නිල reference links

- Resend API keys: https://resend.com/changelog/new-api-key-permissions
- Resend domain/email prerequisites: https://resend.com/docs/send-with-nodejs
- Google OAuth client: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- Supabase keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase storage policies: https://supabase.com/docs/guides/storage/security/access-control
- Payments.lk Node SDK: https://github.com/PAYable-IPG/payments-lk-node
