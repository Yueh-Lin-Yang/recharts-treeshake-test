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

| Branch | 在比較什麼 | 結果（簡化版） |
|---|---|---|
| `experiment/01a-commonjs-single-file` | 一個 CJS 檔同時 export `use` 和 `unuse`，App 只用 `use` | `unuse` 仍進 bundle |
| `experiment/01b-commonjs-aggregator` | 拆成兩個 CJS 檔，再用 `module.exports = {...require()}` 聚合 | `unuse` 仍進 bundle |
| `experiment/02-esm-default-export` | ESM 用 `export default { use, unuse }` 匯出物件 | `unuse` 仍進 bundle |
| `experiment/03a-esm-named-import` | ESM named export，consumer 用 `import { use }` | `unuse` 成功剃除 |
| `experiment/03b-esm-namespace-import` | ESM named export，consumer 用 `import * as api`、靜態 `api.use()` | `unuse` 成功剃除 |
| `experiment/04a-esm-dynamic-key-variable` | 用變數當 method name：`const m = 'use'; api[m]()` | `unuse` 仍進 bundle |
| `experiment/04b-esm-dynamic-key-runtime` | runtime 三元決定 method name：`api[cond ? 'use' : 'unuse']()` | `unuse` 仍進 bundle |
| `experiment/05-esm-side-effect-keeps-unused` | 模組頂層常數（如 secret）與 8 種常見 side effect 寫法 | secret 明文進 bundle，side effect 寫法會保留 unused export |
| `experiment/06a-lodash-default-import` | 真實套件 lodash：`import _ from 'lodash'`，只用 `debounce` | 267 kB（整包進 bundle） |
| `experiment/06b-lodash-named-import` | 同 lodash 但改 `import { debounce } from 'lodash'` | **仍 267 kB**（CJS 無解） |
| `experiment/06c-lodash-es-named-import` | 改用 `lodash-es`（ESM 版）+ named import | **195 kB**（省 71 kB） |

---

## 各實驗在做什麼（白話版）

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

> 📌 **結論**：在 CJS 世界裡，「拆檔」不解決 tree-shake 問題，**關鍵在 export 語法是不是靜態可分析的**。要 tree-shake 友善，請改用 ESM 的 `export { use } from './use.mjs'`。

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

App 只用 `api.use`，但因為 default 匯出的是「一整個物件」，bundler 看到的是「你 import 了這個物件」——它無法靜態分析「你只讀了物件的某個 key」。結果 `unuse` 還是會進 bundle。

> 📌 **結論**：這跟實驗 01 的 CJS 失敗**是同一個原因**——bundler 沒辦法靜態看穿動態物件的 key 存取。要 tree-shake 友善，請改用 ESM 的 **named export**：`export function use() {...}; export function unuse() {...}`，App 端用 `import { use } from './api'`。

### 實驗 03 — ESM named export 對照組（會成功）

**背景**：前面三個實驗都失敗了，這個實驗要證明 **ESM named export** 才是真正讓 bundler 看得懂的寫法。

```ts
// api.ts
export function use() { ... }
export function unuse() { ... }
```

#### 03a — consumer 用具名 import

```ts
// App.tsx
import { use } from './api';
```

bundler 一眼看出 App 只 import 了 `use`——`unuse` 整段被剃掉，連函式裡的字串都不會出現在 bundle。

#### 03b — consumer 用 namespace import

```ts
// App.tsx
import * as api from './api';
api.use();
```

**結果跟 03a 完全一樣**——`unuse` 同樣被剃掉。
為什麼？因為 Vite/Rollup 能追蹤「使用者透過 `api.<key>` 存取了哪些 key」，只要 key 是**靜態可讀**的（直接寫 `api.use`），bundler 就能把沒被存取的 key 連同實作一起丟掉。

> 📌 **結論**：「namespace import 會把整包載進來」是個迷思。只要存取方式是靜態的，namespace import 跟 named import 在 tree-shake 上完全等價。

### 實驗 04 — 動態 key 存取會破壞 tree-shake

**背景**：實驗 03 證明了「靜態存取」OK。那如果 key 不是寫死的字串呢？

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

> 📌 **結論**：寫程式時，**所有針對「方法名」的抽象**（從 props 拿、從設定檔讀、從變數中介）都會讓 tree-shake 失效。要保留 tree-shake，就要讓 import 跟存取**全程靜態可讀**。

### 實驗 05 — Side effect 拖走 unused export，連 secret 一起洩漏

**背景**：實驗 03 證明 ESM named export 可以正確 tree-shake——`unuse` 沒被 App 用到就會被剃掉。實驗 05 要說明的是：

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

> 📌 **tree-shake 結論**：模組頂層**只能放純宣告**（`export function`、`export const = 純運算值`）。任何「執行語句」——尤其上面這幾類——都會讓 bundler 變保守。

### 實驗 06 — 真實套件 lodash：套件本身是 CJS 還是 ESM 決定一切

**背景**：實驗 01–05 都是我們自己寫的小例子。實驗 06 換成真實世界最知名的工具庫 **lodash**，看看「我只用一個 `debounce`」這個簡單需求，bundle 會差多少。

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

> 📌 **lodash 實務建議**：用 `lodash-es` 而不是 `lodash`。或更激進——換到沒有 CJS 包袱的現代替代品如 [es-toolkit](https://github.com/toss/es-toolkit)。

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