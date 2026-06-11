import { debounce } from 'lodash';

const debounced = debounce((label: string) => console.log(label), 200);

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 06b — lodash named import（但 lodash 本身是 CJS）</h1>
      <p>只 import debounce，預期會發現 bundle 還是很大——因為 lodash 是 CJS。</p>
      <button onClick={() => debounced('clicked')}>click me</button>
    </div>
  );
}
