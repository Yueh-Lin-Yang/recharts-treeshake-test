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