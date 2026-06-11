# 實驗 08 — 依賴鏈幻覺：依賴圖

> 對應分支：`experiment/08-dependency-chain-illusion`
> 來源：recharts 3.8.1 原始碼追蹤

---

## 你寫的 import

```ts
import { LineChart, Line, Tooltip } from 'recharts';
```

只有三個 component。但 build 完打開 `dist/report.html`，會看到 `Rectangle`、`Cross`、`Cursor`、`Curve`、`Sector`、`Symbols`… 等一堆「我沒寫過」的模組。

下面兩條鏈解釋為什麼。

---

## 鏈 A：Tooltip → Cursor → 形狀群

**這條鏈就是 ~28 kB 的來源**（對照組驗證：拿掉 `<Tooltip>` 後 bundle 從 510 kB → 481 kB）。

```
你寫的: import { Tooltip } from 'recharts'
         │
         ▼
   component/Tooltip.js
         │ import { Cursor }
         ▼
   component/Cursor.js
         │ import { Curve, Cross, Rectangle, Sector }
         ▼
   ┌─────────┬─────────┬─────────────┬─────────┐
   ▼         ▼         ▼             ▼
 Curve.js  Cross.js  Rectangle.js  Sector.js
```

**證據**：`node_modules/recharts/es6/component/Cursor.js` 第 4–8 行：

```js
import { Curve } from '../shape/Curve';
import { Cross } from '../shape/Cross';
import { Rectangle } from '../shape/Rectangle';
import { Sector } from '../shape/Sector';
```

**為什麼 `Cursor` 要載四種形狀？**
因為 cursor 可能是線（Curve）、十字（Cross）、矩形（Rectangle，常見於直方圖 hover bar）或扇形（Sector，pie chart）。`Cursor` 不知道你用的是哪種圖表——它在 runtime 才根據 chart context 選擇——所以**頂層全都 import**。

---

## 鏈 B：LineChart → CartesianChart → CategoricalChart

```
你寫的: import { LineChart, Line } from 'recharts'
         │
         ▼
   chart/LineChart.js
         │ import { CartesianChart }
         ▼
   chart/CartesianChart.js
         │ import { CategoricalChart, RechartsStoreProvider, ... }
         ▼
   chart/CategoricalChart.js
         │ import { RootSurface, RechartsWrapper, ClipPathProvider, ... }
         ▼
   [Redux store、context providers、SVG container...]
```

這條鏈本身**沒有**直接 import `Rectangle` / `Cross`。所以對照組才能成立——拿掉 `Tooltip`，Rectangle 引用次數就少 1，Symbols 少 17 個，bundle 少 28 kB。

> Rectangle 不是 LineChart 拉的，是 **Tooltip → Cursor** 拉的。

---

## 為什麼這條鏈無法被 tree-shake 砍掉？

`Cursor.js` 頂層**靜態 import** 了四種形狀。bundler 看到「Cursor 模組被用到」→ 它的所有 top-level import 都必須打包。bundler 沒辦法知道「實際 runtime 只會走其中一個 branch」——那是執行期才決定的。

這跟實驗 04（動態 key）是同一個道理的鏡像：

| 實驗 04 | 實驗 08 |
|---|---|
| 你寫 `api[var]()`，runtime 才知道 key | recharts 寫 `if (chartType === 'pie') return <Sector/>`，runtime 才知道形狀 |
| Bundler 保留所有 key 的實作 | Bundler 保留所有形狀的實作 |

**靜態 import 全收，runtime 分支選擇對 bundler 不可見。**

---

## 對照組殘留物

拿掉 `<Tooltip>` 後 `Rectangle: 1` / `Cross: 1` 仍出現在 grep 結果——這些是 minified bundle 裡的**字串字面值**（例如 `displayName = 'Rectangle'` 或 shape type 字串比對），不是真正的 component 程式碼。

**28 kB 的 size 差才是真信號，不是 grep 出來的識別符次數。**

---

## 怎麼自己重現對照組

```bash
git checkout experiment/08-dependency-chain-illusion
npm install
npm run build
# 紀錄 bundle size

# 編輯 src/App.tsx，移除 <Tooltip /> 與對應 import
npm run build
# 比較 bundle size 差異
```
