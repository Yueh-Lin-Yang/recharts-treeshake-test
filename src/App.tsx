import api from '@/lib/api';

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 02 — ESM export default 物件</h1>
      <p>{api.use()}</p>
    </div>
  );
}
