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
npm run build   # 產出 bundle 並打開分析報告
```

---

## 實驗列表

| Branch | 在比較什麼 | 結果（簡化版） |
|---|---|---|
| `experiment/named-imports` | recharts v2：整包 import vs 只挑要用的 import | 幾乎沒差 |
| `experiment/recharts-v3` | recharts 升級 v2 → v3 | 變小約 49 KB |
| `experiment/v3-named-imports` | recharts v3：整包 import vs 只挑要用的 import | 幾乎沒差 |
| `experiment/inline-exports` | 把 export 寫法改成 inline | 完全沒差 |
| `experiment/zustand-sideeffects` | zustand：有沒有真的用 store 對 bundle 的影響 | 看 branch 內 report |

---

## 各實驗在做什麼（白話版）

### 1. `experiment/named-imports` — 整包拿 vs 挑著拿

想像你只想要冰箱裡的牛奶，有兩種拿法：
- **整包拿**：把整台冰箱搬回家（`import * as Recharts from 'recharts'`）
- **挑著拿**：只拿一瓶牛奶（`import { LineChart } from 'recharts'`）

直覺上「挑著拿」應該比較輕，但實際打包後**幾乎沒差**。為什麼？因為 Vite 的 tree-shaking 已經夠聰明，能看穿你只用了牛奶。

### 2. `experiment/recharts-v3` — 換新版套件

把 recharts 從 v2 升級到 v3。結果 bundle 變小約 **49 KB**。這代表新版套件作者重新設計了內部結構，讓不用的東西更容易被丟掉。

> 📌 **要點**：有時候 bundle 變大不是你的錯，是套件本身的問題。升級可能就解決了。

### 3. `experiment/v3-named-imports` — 新版套件下，寫法還重要嗎？

到了 v3，再做一次「整包拿 vs 挑著拿」的比較。答案仍然是**幾乎沒差**。
這個實驗在驗證：v3 的改善是普遍的，不是只對某種寫法生效。

### 4. `experiment/inline-exports` — export 寫法的差別

JavaScript 中宣告匯出有好幾種寫法：

```ts
// 寫法 A：分開
const foo = () => {};
export { foo };

// 寫法 B：inline
export const foo = () => {};
```

直覺上會擔心「寫法 A 是不是會打包不乾淨」，這個實驗證明**兩種寫法產出的 bundle 完全一樣**，所以照你喜歡的風格寫即可。

### 5. `experiment/zustand-sideeffects` — 「宣告了但沒用到」會被打包進去嗎？

zustand 是一個狀態管理工具。實驗比較兩種狀況：
- 引入 zustand 但沒有實際使用任何 store
- 引入 zustand 並建立一個 store 來使用

用來觀察套件的 **side effect**（副作用）標記是否運作正常——理想上「沒用到」就應該被完全丟掉。

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