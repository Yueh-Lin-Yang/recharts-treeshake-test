/*
 * From the bundler's point of view —— 以下這些都算 side effect:
 *
 *   - Affects browser state, e.g. console.log / localStorage / history
 *   - fetch / XMLHttpRequest
 *   - DOM interaction
 *   - Affects the Event Loop, e.g. setTimeout / setInterval / Promise / queueMicrotask
 *   - ~~JSON.parse~~ / JSON.stringify (may throw an error)
 *   - throw / any API that can throw
 *   - Object.assign
 *
 * 只要模組頂層出現以上任何一種，bundler 都會保守地保留整個模組，
 * 連 unused export（例如下面的 unuse）也一起被保留。
 *
 * 取消下面任一行的註解 rebuild，就能看到 UNUSE_METHOD_MARKER 重新出現在 bundle 裡。
 */

console.log('[api] module loaded', { use, unuse });
// (window as unknown as Record<string, unknown>).__api = { use, unuse };
// document.title = 'api-loaded';
// setTimeout(() => unuse(), 0);
// JSON.stringify({ use, unuse });
// if (!unuse) throw new Error('boom');
// Object.assign(globalThis, { use, unuse });

export function use() {
  return 'USE_METHOD_MARKER — App 真的會用到的方法';
}

// ⚠️ 資安陷阱：secret 即使只被「沒人用的 unuse」引用，
// 只要某個 side effect 把 unuse 拉進 bundle，secret 就會跟著被打包進去。
// 真實世界例子：feature flag、debug helper、舊版相容函式裡藏著的 API key / JWT secret。
const secretKey = 'SECRET_MARKER_sk-live-1234567890abcdef';

export function unuse() {
  return `UNUSE_METHOD_MARKER — App 不會用到，但用了 secretKey: ${secretKey}`;
}