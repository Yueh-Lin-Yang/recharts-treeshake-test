import * as api from '@/lib/api';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 03 — ESM named export（對照組）</h1>
      <p>{api.use()}</p>
    </div>
  );
}
