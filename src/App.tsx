import { UserSchema } from '@/schemas';

const result = UserSchema.safeParse({ name: 'lynn', age: 30 });

export function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>實驗 07a — 所有 zod schema 寫在同一檔案</h1>
      <p>App 只用 UserSchema，但其他 5 個 schema 都會出現在 bundle 嗎？</p>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
