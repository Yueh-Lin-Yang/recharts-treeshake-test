import { use } from '@/lib/methods.cjs';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 01 — CommonJS</h1>
      <p>{use()}</p>
    </div>
  );
}
