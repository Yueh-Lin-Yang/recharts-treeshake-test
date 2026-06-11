// 模組頂層 side effect：把所有方法註冊到 global registry。
// 這一行在 import 時必跑，且引用了 unuse，因此 unuse 實作會被保留。
// (globalThis as Record<string, unknown>).__methodRegistry = { use, unuse };

// 其他常見會破壞 tree-shake 的模組頂層 side effect（任選一種就有同樣效果）：

// 1. console.log / 模組層級日誌
// console.log('[api] module loaded', { use, unuse });

// 2. 設定全域變數（window / globalThis）
// (window as any).__api = { use, unuse };

// 3. 改動內建 prototype（polyfill 的常見寫法）
// Array.prototype.toUseString = function () { return use(); };

// 4. import CSS / 靜態資源（純粹為了引發副作用）
// import './api.css';

// 5. 模組頂層 new 一個物件（例如建立 EventEmitter、Subject、Map cache）
// const _cache = new Map<string, Function>();
// _cache.set('use', use);
// _cache.set('unuse', unuse);

// 6. 模組頂層立即呼叫工廠函式（無 /*#__PURE__*/ 標註）
// const _registered = registerAll({ use, unuse });

// 7. 第三方 SDK 模組頂層 init（例：analytics、Sentry）
// analytics.register('use', use);
// analytics.register('unuse', unuse);

// 8. 模組頂層執行 IIFE
// (() => { Object.assign(globalThis, { use, unuse }); })();

export function use() {
  return `USE_METHOD_MARKER — 我會用到 secretKey: ${secertKey}`;
}

// ⚠️ 資安陷阱：模組頂層常數即使「看起來只給 use 用」，
// 只要這個模組被任何地方 import，這個字串就會原封不動進 bundle，
// 公開 source map / 直接 view source 都能看到。
// 真實世界例子：API key、JWT secret、第三方 service token 被誤放在 client 端模組。
const secertKey = 'SECRET_MARKER_sk-live-1234567890abcdef';

export function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，但模組頂層 side effect 引用了它，bundler 不敢丟';
}