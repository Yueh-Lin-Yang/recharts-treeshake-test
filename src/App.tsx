import * as api from '@/lib/api';

const methodName: keyof typeof api = 'use';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 04a — 用變數當作 method name</h1>
      <p>{api[methodName]()}</p>
    </div>
  );
}
