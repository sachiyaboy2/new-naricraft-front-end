# Frontend update v2

මෙම ZIP එක කලින් දුන් fixed frontend එකට කරන update එකයි. Backend වෙනස් කිරීමට අවශ්‍ය නැත. දැනට sandbox payments වැඩ කරන backend සහ එහි `.env` තබාගන්න.

## යොදන ආකාරය

1. ඔබේ දැනට භාවිතා කරන frontend `.env` එක වෙනම තබාගන්න.
2. මෙම ZIP එක extract කර ලැබෙන `Front-END` folder එකට එම `.env` එක copy කරන්න. ZIP එකට private `.env` values ඇතුළත් කර නැත.
3. අලුත් `Front-END` folder එකේ `npm ci` පසුව `npm run dev` කරන්න. පරණ Vite server එක නවතා අලුත් folder එකේ server එක run කරන බව තහවුරු කරන්න.
4. Browser එකේ Ctrl+Shift+R කර නැවත load කරන්න.

## වෙනස්කම්

- `/admin/orders`: orders තිබුණු විට selectedOrder තවම null වුවත් payment panel එක table row තුළ render වීම නිසා crash විය. දැන් payment details පෙන්වන්නේ තෝරාගත් order එකේ modal එක තුළ පමණි. Balance collection button එකත් එම modal එකේ පවතී.
- Product overview: product details උඩ තිබුණු කුඩා Add to Cart button එක Share button එකකට මාරු කර ඇත. පහළ Add to Cart button එක සහ header cart එක පෙර පරිදිම පවතී.
- Share: device/browser support තිබුණොත් share menu එක open වේ. නැත්නම් product link එක copy වේ. Clipboard අවසරත් නැත්නම් manually copy කිරීමට link field එකක් පෙන්වයි. Share menu cancel කිරීම error එකක් ලෙස නොපෙන්වයි.
- Product hearts: save/remove, filled-heart state, confirmation toast සහ browser storage persistence එකතු කර ඇත.
- Products page: `Favourites (count)` filter එකෙන් save කළ items බලන්න පුළුවන්. Search/category filters සමඟත් ක්‍රියාකරයි.
- Favourites save වන්නේ මෙම browser/profile එකේ පමණි; account database sync එකක් නොවේ. Incognito/private window එක වසා දැමූ විට ඒ session එකේ favourites නැතිවිය හැක.

## Verification

Frontend regression tests 6/6 passed (`npm test`): saved-heart storage, storage failure, native/clipboard/manual share and cancellation, populated admin orders with no modal selected, one overview cart action plus Share, and payment details inside the selected-order dialog only.

ESLint සහ production build pass. Component tests React server rendering සහ controlled state fixtures භාවිතා කරයි; browser clicks/live backend calls පරීක්ෂා කළ බවක් මෙයින් අදහස් නොවේ. Password-reset email එක මෙම update එකෙන් වෙනස් කර නැත.
