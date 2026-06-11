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

| Branch | 在比較什麼 | 結果（簡化版） |
|---|---|---|
| _尚未加入_ | | |

---

## 各實驗在做什麼（白話版）

_尚未加入實驗。新增實驗後會在這裡用白話解釋每個實驗在問什麼問題、結論是什麼。_

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