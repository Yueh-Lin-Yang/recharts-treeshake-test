import { use } from '@/lib/api';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 04 解法 — 拆檔讓 side effect 不再拖走 unused export</h1>
      <p>{use()}</p>
      <p>
        App 只 import 純宣告檔 <code>@/lib/api</code>，
        side effect 集中在 <code>@/lib/api-init</code> 裡——沒被 import 就不會
        進 bundle。在 <code>dist/assets/*.js</code> 裡 grep 「UNUSE」或「SECRET」
        應該都找不到（除了註解中提到「unused export」這類無關字眼之外）。
      </p>
    </div>
  );
}
