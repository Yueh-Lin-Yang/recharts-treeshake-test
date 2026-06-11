import { use } from '@/lib/api';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 05 — side effect 引用 unused export，破壞 tree-shake</h1>
      <p>{use()}</p>
    </div>
  );
}
