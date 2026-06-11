import { use } from '@/lib/api/use';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 04 解法 — per-function 拆檔，沒被 import 的檔整個消失</h1>
      <p>{use()}</p>
      <p>
        App 只 import <code>@/lib/api/use</code>。另一個檔
        <code>@/lib/api/unuse</code>（含 side effect、secret、unused function）
        沒有任何模組 import 它——整個檔不會進 bundle，連 side effect 都不會跑。
      </p>
    </div>
  );
}
