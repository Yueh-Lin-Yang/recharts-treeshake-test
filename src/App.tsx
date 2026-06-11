import { debounce } from 'lodash-es';

const debounced = debounce((label: string) => console.log(label), 200);

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 06c — lodash-es named import（ESM）</h1>
      <p>lodash-es 是 ESM 版的 lodash，預期 bundle 大幅縮小。</p>
      <button onClick={() => debounced('clicked')}>click me</button>
    </div>
  );
}
