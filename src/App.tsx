import { use } from '@/lib/index.cjs';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 01b — CommonJS aggregator</h1>
      <p>{use()}</p>
    </div>
  );
}
