# Tree-shaking Playground

> 一個用來「看見」前端 bundle 大小怎麼變化的實驗場。每個實驗一個 branch，互不干擾。

---

## 這個專案在問什麼？

當我們做網頁時，會用到很多別人寫好的工具包（套件）。網頁打包的時候，理想狀況下「沒用到的程式碼會被自動丟掉」，這個動作叫做 **Tree-shaking**（搖樹，把枯葉搖掉）。

但實際情況沒這麼單純。**寫法不一樣、套件版本不一樣、import 方式不一樣，最後產出的檔案大小都會不一樣。** 使用者下載的網頁愈大，開啟速度就愈慢。

這個專案就是把這些「不一樣」一個一個拆開來比較，讓你親眼看到差別。

---

## 怎麼閱讀這個專案？

main 分支是空的起點（只是一個乾淨的 Vite + React + TypeScript 專案）。
**每個實驗都在自己的 branch 裡**，這樣你可以一次只看一個變因。

切換實驗的指令：

```bash
git checkout experiment/<實驗名稱>
npm install
npm run build
```

每次 `npm run build` 都會自動產出一份視覺化報告 `dist/report.html`（由 [vite-bundle-analyzer](https://github.com/nonzzz/vite-bundle-analyzer) 產生），用瀏覽器打開就能看到每個套件、每個檔案佔了多少體積。

---

## 實驗列表

實驗依主題分組：相同主題的不同變體用 `01a`、`01b` 區分；不同主題之間用 `01`、`02` 區分。

| 主題 | 問題分支 | 問題簡述 + 結果 | 解法分支 | 解法簡述 |
|---|---|---|---|---|
| 01 CommonJS export | `experiment/01a-commonjs-single-file`<br>`experiment/01b-commonjs-aggregator` | CJS `module.exports = {...}` 是動態物件，bundler 無法靜態分析 → `unuse` 全洩漏 | `experiment/esm-named-import` | 改用 ESM `export function` + `import { use }` |
| 02 ESM default object | `experiment/02-esm-default-export` | `export default { use, unuse }` 仍是動態物件 → `unuse` 洩漏 | `experiment/esm-named-import` | 改用 named export，不是 default 包成物件 |
| 03 動態 key 存取 | `experiment/03a-esm-dynamic-key-variable`<br>`experiment/03b-esm-dynamic-key-runtime` | `api[m]()` 任何 key 變數化 → 所有 key 都得保留 | `experiment/esm-namespace-import` | 寫死 `api.use()` 讓 key 靜態可讀 |
| 04 Side effect 拖走 export | `experiment/04-esm-side-effect-keeps-unused` | 模組頂層執行語句引用 unused export → 連 secret 一起洩漏 | `experiment/esm-named-import` | 模組頂層只放純宣告 |
| 05 CJS 套件 lodash | `experiment/05a-lodash-default-import`<br>`experiment/05b-lodash-named-import` | `lodash` 是 CJS，267 kB 整包進 bundle，換寫法救不了 | `experiment/05-solution-lodash-es-named-import` | 改用 `lodash-es`（ESM 重新打包），195 kB |
| 06 Schema 寫同一檔 | `experiment/06-zod-all-in-one-file` | `z.object({...})` 在頂層被視為 side effect → 6 個 schema 全洩漏 | `experiment/06-solution-zod-one-file-per-schema` | 一檔一 schema，bundler 從檔案邊界精準切割 |
| 07 依賴鏈幻覺 | `experiment/07-dependency-chain-illusion` | 只 import `LineChart + Line + Tooltip`，bundle 卻出現 `Rectangle` / `Cross` → 誤判 tree-shake 失敗 | （無解法，是認知陷阱） | tree-shake 正常，是 `Tooltip → Cursor → Rectangle/Cross` 依賴鏈拉的 |

---

## 各實驗在做什麼（白話版）

### 解法樣板 — ESM named export（後面所有「解法」都長這樣）

在看每個問題之前，先認識解法的「黃金樣板」——這是 `esm-named-import` / `esm-namespace-import` 兩個分支證明可行的寫法，後面 01 / 02 / 04 / 05 的解法都是回到這個樣板：

```ts
// api.ts
export function use() { ... }
export function unuse() { ... }
```

```ts
// App.tsx
import { use } from './api';   // esm-named-import
// 或
import * as api from './api';  // esm-namespace-import（靜態 dot access）
api.use();
```

**為什麼這個樣板有效**：`export function` 是**靜態宣告**，bundler 一眼看完整個檔案就能列出所有 export 的名稱和位置。consumer 端只要用 named import 或靜態 dot access，bundler 就能精準連線哪些 export 被用到。沒被連到的 export 連同實作一起丟掉。

> 📌 **常見迷思**：「namespace import (`import * as`) 會把整包載進來」——**錯**。只要存取是靜態的（`api.use()`，不是 `api[var]()`），namespace import 跟 named import 在 tree-shake 上完全等價。

---

### 實驗 01 — CommonJS 為什麼沒辦法 tree-shake？

**背景**：JavaScript 有兩種模組系統，**ESM**（現代）和 **CommonJS / CJS**（老的、Node.js 早期的）。CJS 的「我要 export 什麼」是執行到那一行才確定的，所以打包工具沒辦法事先看穿你「實際用了哪些」。

#### 01a — 一個檔案放兩個方法

```js
// methods.cjs
module.exports = { use, unuse };
```

App 只用 `use`，但因為 `module.exports = {...}` 是一個 runtime 物件，bundler 無法靜態判斷你沒用 `unuse`，所以**整包都進 bundle**。

> 📌 **直覺反應**：「那我把它拆成兩個檔總可以了吧？」 → 看 01b。

#### 01b — 拆成兩個檔，用聚合 barrel

```js
// index.cjs
module.exports = {
  ...require('./use.cjs'),
  ...require('./unuse.cjs'),
};
```

App 只 `import { use }`，但因為聚合用 `...require()` spread，bundler 連「這個聚合物件最後有哪些 key」都推不出來——只能保守地把 `use.cjs` 跟 `unuse.cjs` **整包打進去**。`unuse` 還是會在 bundle 裡。

> ✅ **解法分支**：[`experiment/esm-named-import`](#解法樣板--esm-named-export後面所有解法都長這樣) — 改用 ESM `export function` + named import。在 CJS 世界裡，「拆檔」不解決 tree-shake 問題，**關鍵在 export 語法是不是靜態可分析的**。

### 實驗 02 — 用了 ESM，但 export default 一個物件

**背景**：很多人以為「我用了現代的 ESM 寫法，tree-shake 就會自動有效」。其實不一定——關鍵不只是「用 ESM」，還要看你**怎麼 export**。

```ts
// api.ts
export default { use, unuse };
```

```ts
// App.tsx
import api from './api';
api.use();
```

App 只用 `api.use`，但因為 default 匯出的是「一整個物件」，bundler 看到的是「你 import 了這個物件」——它無法靜態分析「你只讀了物件的某個 key」。結果 `unuse` 還是會進 bundle。這跟實驗 01 的 CJS 失敗**是同一個原因**：bundler 沒辦法靜態看穿動態物件的 key 存取。

> ✅ **解法分支**：[`experiment/esm-named-import`](#解法樣板--esm-named-export後面所有解法都長這樣) — 改用 **named export**，不要把所有東西包成 default 物件。

### 實驗 03 — 動態 key 存取會破壞 tree-shake

**背景**：解法樣板用「靜態 dot access」（`api.use()`），如果 key 不是寫死的字串會怎樣？

#### 04a — 用變數當 key

```ts
const methodName = 'use';
api[methodName]();
```

雖然 `methodName` 看起來明顯就是 `'use'`，但 bundler 為了安全**不敢做這種推論**——它只能保留所有 key 的實作。`unuse` 仍進 bundle。

#### 04b — runtime 才決定 key

```ts
const methodName = Math.random() > 0.5 ? 'use' : 'unuse';
api[methodName]();
```

更明顯的動態存取，理所當然 bundler 兩個 key 都得保留。

> ✅ **解法分支**：[`experiment/esm-namespace-import`](#解法樣板--esm-named-export後面所有解法都長這樣) — 寫死 `api.use()`，讓存取的 key 對 bundler **全程靜態可讀**。所有針對「方法名」的抽象（從 props 拿、從設定檔讀、從變數中介）都會讓 tree-shake 失效。

### 實驗 04 — Side effect 拖走 unused export，連 secret 一起洩漏

**背景**：解法樣板（`experiment/esm-named-import`）證明 ESM named export 可以正確 tree-shake——`unuse` 沒被 App 用到就會被剃掉。實驗 04 要說明的是：

> **只要模組頂層有一行 side effect 引用了某個 unused export，那個 export 就會被「拖回」bundle。如果這個 export 內部又引用了 secret 常數，secret 也會跟著明文打包。**

#### 結構

```ts
// api.ts
console.log('[api] module loaded', { use, unuse });  // ← 模組頂層 side effect，引用了 unuse

export function use() { return 'USE_METHOD_MARKER'; }

const secretKey = 'SECRET_MARKER_sk-live-1234567890abcdef';

export function unuse() {
  return `UNUSE — 用到 ${secretKey}`;  // ← 只有 unuse 引用 secret
}
```

```ts
// App.tsx
import { use } from './api';  // App 只用 use
```

#### 連鎖反應

| 環節 | 為什麼會被保留 |
|---|---|
| App import `use` | 整個 `api.ts` 模組被載入 |
| 模組頂層 `console.log(..., { use, unuse })` | side effect，bundler 不敢丟，且引用了 `unuse` |
| `unuse` 函式本體 | 被上一行引用，必須保留 |
| `secretKey` 常數 | 被 `unuse` 引用，必須保留 |

最終 bundle 同時包含 `USE_METHOD_MARKER`、`UNUSE_METHOD_MARKER`、`SECRET_MARKER`——**即使 App 從頭到尾沒用 `unuse` 也沒讀 `secretKey`**。

#### 從 bundler 的視角看，哪些東西算 side effect？

只要模組頂層出現以下任何一種，bundler 都會把整段保留：

- **改動瀏覽器狀態**：`console.log`、`localStorage`、`history`
- **網路請求**：`fetch`、`XMLHttpRequest`
- **DOM 互動**
- **影響 event loop**：`setTimeout`、`setInterval`、`Promise`、`queueMicrotask`
- ~~`JSON.parse`~~ / `JSON.stringify`（可能 throw error）
- `throw` 或任何**可能 throw** 的 API
- `Object.assign`（會改動目標物件）

但要區分兩件事：
- **「side effect 必跑」**：以上任何一種，那條語句一定進 bundle
- **「unused export 被拖回」**：只有當 side effect **明文引用了那個 export 識別符**時才會發生

例如 `document.title = 'loaded'` 是 side effect，但沒提到 `unuse`，所以 `unuse` 仍會被剃。
但 `console.log({ unuse })` 既是 side effect 又引用了 `unuse`——`unuse`（連同它引用的 secret）就跑不掉了。

> 📌 **資安結論**：bundler 沒有「機密」概念。任何放在 client 端的常數——API key、JWT secret、第三方 service token——只要有任何一條 reference 鏈從可達區（reachable code）通到它，就會以**明文**進 bundle。minify 不會加密字串，只會混淆變數名。**不要把 secret 放在 client 程式碼裡，就這樣。**

> ✅ **解法分支**：[`experiment/esm-named-import`](#解法樣板--esm-named-export後面所有解法都長這樣) — 模組頂層**只能放純宣告**（`export function`、`export const = 純運算值`），不要在頂層執行語句。回到解法樣板的乾淨狀態，side effect 自然不會把 unused export 拖回來。

### 實驗 05 — 真實套件 lodash：套件本身是 CJS 還是 ESM 決定一切

**背景**：實驗 01–04 都是我們自己寫的小例子。實驗 05 換成真實世界最知名的工具庫 **lodash**，看看「我只用一個 `debounce`」這個簡單需求，bundle 會差多少。

對照組（baseline 沒 lodash）約 **193 kB**。

#### 06a — `import _ from 'lodash'`

```ts
import _ from 'lodash';
_.debounce(...);
```

Bundle: **267 kB**。整包 lodash 進來——`cloneDeep`、`throttle`、`isEqual`、`groupBy`… 全部都在，雖然只用了 `debounce`。

#### 06b — 改成 named import，能救嗎？

```ts
import { debounce } from 'lodash';
debounce(...);
```

Bundle: **267 kB**——**幾乎一模一樣**。為什麼？因為 npm 上的 `lodash` 套件**仍然是 CJS 格式**（`module.exports = ...`）。這就是實驗 01 的真實版本：CJS 沒辦法 tree-shake，**換寫法救不了**。

#### 06c — 改用 `lodash-es`（ESM 版）

```ts
import { debounce } from 'lodash-es';
debounce(...);
```

Bundle: **195 kB**——只多了 ~2.5 kB（就是 `debounce` 本身的程式碼）。

**`lodash-es`** 是 lodash 官方提供的 **ESM 重新打包版本**，每個函式都是獨立的 ESM 模組，bundler 能精準剃掉沒用到的。

| 寫法 | Bundle | 增加 |
|---|---|---|
| 06a `import _ from 'lodash'` | 267 kB | +74 kB |
| 06b `import { debounce } from 'lodash'` | 267 kB | +74 kB |
| 06c `import { debounce } from 'lodash-es'` | 195 kB | **+2.5 kB** |

> 📌 **結論**：tree-shake 友善度不只取決於**你怎麼寫 import**，更取決於**這個套件本身是怎麼打包出來的**（CJS / ESM / 兩者都有）。挑套件時值得多看一眼：package.json 裡有沒有 `"module"` 或 `"exports"` 欄位指向 ESM 版本？沒有的話，再聰明的 import 寫法都救不回來。

> ✅ **解法分支**：[`experiment/05-solution-lodash-es-named-import`](#實驗-05--真實套件-lodash套件本身是-cjs-還是-esm-決定一切) — 改用 `lodash-es`（lodash 的 ESM 重新打包版）。或更激進——換到沒有 CJS 包袱的現代替代品如 [es-toolkit](https://github.com/toss/es-toolkit)。

### 實驗 06 — zod：即使是 ESM 套件，「把 schema 全塞同一檔案」也會洩漏

**背景**：實驗 05 教的是「套件格式（CJS vs ESM）決定 tree-shake 上限」。但用了 ESM 套件就一定 OK 嗎？不一定——還要看**你怎麼組織自己寫的程式碼**。

zod 是現代 ESM-first 的驗證庫，這個實驗用它當素材，看「把 6 個 schema 寫在同一個檔案 vs 拆成 6 個檔案」差多少。

#### 07-zod-all-in-one-file（問題）

```ts
// src/schemas.ts
import { z } from 'zod';

export const UserSchema = z.object({ ... 'USER_SCHEMA_MARKER' ... });
export const ProductSchema = z.object({ ... 'PRODUCT_SCHEMA_MARKER' ... });
export const OrderSchema = z.object({ ... 'ORDER_SCHEMA_MARKER' ... });
export const PaymentSchema = z.object({ ... });
export const AddressSchema = z.object({ ... });
export const ShipmentSchema = z.object({ ... });
```

```ts
// App.tsx
import { UserSchema } from '@/schemas';  // 只用一個
```

**結果**：bundle 約 260 kB，6 個 schema 的 marker **全部都在裡面**。

為什麼？`z.object({...})` 是模組頂層的函式呼叫——bundler 無法靜態斷定它是 pure（呼應實驗 04），所以即使 `ProductSchema` 沒被 App 用到，這行 `export const ProductSchema = z.object(...)` 仍會被保留（怕 `z.object()` 有 side effect）。

#### 07-solution-zod-one-file-per-schema（解法）

```
src/schemas/
  user.ts        ← export const UserSchema = z.object({...})
  product.ts     ← export const ProductSchema = z.object({...})
  order.ts
  payment.ts
  address.ts
  shipment.ts
```

```ts
// App.tsx
import { UserSchema } from '@/schemas/user';  // 直接指到那個檔案
```

**結果**：bundle 約 260 kB（跟問題版幾乎一樣），但 5 個未用 schema 的 marker **全部不見了**。

為什麼大小幾乎一樣？因為 zod runtime 本身（`z.string()`、`z.object()`、parse engine）就佔了主要 footprint，每個 schema 物件本身只有 ~0.1 kB。但**結構上**問題已經被解決——`product.ts` 整個檔案沒被任何人 import → bundler 安心丟掉。

#### 兩層教訓

1. **應用層**：「一檔多 schema」即使 ESM 也會洩漏，因為 `z.object({...})` 等於把所有 schema 物件「同時宣告 + 同時呼叫工廠函式」綁在同一個模組——bundler 只能整批保留。**一檔一 schema** 才能讓 bundler 從「檔案」這個邊界精準切割。

2. **套件層**：拆檔解決應用層洩漏，但解不了**套件自己很大**的問題。zod core runtime 在那邊，就算你一個 schema 都沒寫，光 `import { z } from 'zod'` 就帶來 ~67 kB。這就是 zod v4 推出 `zod/mini` 的原因——把 runtime 切成可剃除的小單元。

> 📌 **結論**：tree-shake 的單位是**模組（檔案）**，不是 `export`。同個檔案內有任何函式呼叫，整個檔案的所有 export 都會綁在一起。Schema、constants、配置、style tokens——當你把它們塞同一檔，就等於放棄了 tree-shake 的機會。

> ✅ **解法分支**：[`experiment/06-solution-zod-one-file-per-schema`](#實驗-06--zod即使是-esm-套件把-schema-全塞同一檔案也會洩漏) — 一檔一 schema，bundler 從檔案邊界精準切割。

### 實驗 07 — 依賴鏈幻覺：看到陌生模組 ≠ tree-shake 失敗

**背景**：前面 01–06 都是「真的失敗」。實驗 07 反過來，講一個**容易誤判的場景**——你看到 bundle report 出現 `Rectangle.js`、`Cross.js`，但你的程式碼裡明明只寫了 `<LineChart>` + `<Line>` + `<Tooltip>`，沒寫過 `<Bar>` 或 `Cross`。直覺反應：「tree-shake 是不是壞了？」

**真相**：tree-shake 正常運作。`Tooltip` 內部用了 `Cursor`，而 `Cursor` 為了支援不同圖表類型的 hover 樣式，頂層靜態 import 了 `Curve`、`Cross`、`Rectangle`、`Sector` 四種形狀——這條依賴鏈從你看不到的地方把它們拉進來。

**判斷準則：對照組測試**
- 拿掉一個你「有用」的 import（例如 `<Tooltip>`），重 build
- 如果 bundle 變小、那些陌生模組減少 → tree-shake 在工作，它們只是依賴鏈拖進來的
- 如果 bundle 完全不變 → 才是真的 tree-shake 失敗（回去找實驗 01–06 的形狀）

本實驗實測：移除 `<Tooltip>` 後 bundle 從 510 kB → 481 kB（−28 kB），證實依賴鏈是真實的。

> 📌 **完整依賴圖與證據**：見 [DEPENDENCY_CHAIN.md](./DEPENDENCY_CHAIN.md)（含 `Tooltip → Cursor → Rectangle/Cross` 與 `LineChart → CartesianChart` 兩條鏈的原始碼追蹤）。

> 📌 **跟實驗 03 的鏡像關係**：實驗 03 是「你寫動態 key，bundler 無法靜態分析」；實驗 07 是「套件內部的 runtime 分支，bundler 也無法靜態分析」。同一個原理的兩面。

---

## 名詞小辭典

- **Bundle**：網頁打包後產生的 JavaScript 檔案。檔案愈小，使用者開啟網頁愈快。
- **Tree-shaking**：打包工具自動移除沒用到的程式碼。
- **Import**：在程式碼裡「引入」別人寫好的工具。
- **Side effect**：程式碼被引入時就會執行的動作（例如註冊全域變數）。有 side effect 的程式碼通常不能被丟掉。

---

## 怎麼新增一個實驗？

1. 從 main 開新 branch：`git checkout -b experiment/我的實驗`
2. 安裝需要的套件、寫程式碼
3. `npm run build` 產出 bundle，記錄結果
4. 把結果加進這份 README 的表格

---

## License

MIT