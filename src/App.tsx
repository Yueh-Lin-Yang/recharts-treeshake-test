import _ from 'lodash';

const debounced = _.debounce((label: string) => console.log(label), 200);

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 06a — lodash default import</h1>
      <p>只用 debounce 一個方法，但用 default import 整包 lodash 拉進來。</p>
      <button onClick={() => debounced('clicked')}>click me</button>
    </div>
  );
}
