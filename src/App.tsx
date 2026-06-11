import { UserSchema } from '@/schemas/user';

const result = UserSchema.safeParse({ name: 'lynn', age: 30 });

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 07-solution — 拆檔，一檔一個 schema</h1>
      <p>App 只 import UserSchema，預期其他 5 個 schema 不會出現在 bundle。</p>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
