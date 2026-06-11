import * as api from '@/lib/api';

export function App() {
  const methodName: keyof typeof api = Math.random() > 0.5 ? 'use' : 'unuse';
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 04b — runtime 決定 method name</h1>
      <p>{api[methodName]()}</p>
    </div>
  );
}
