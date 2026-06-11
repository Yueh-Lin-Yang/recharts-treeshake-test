/*
 * 這個檔案故意保留問題分支的所有壞東西：頂層 side effect、secret 常數、
 * 引用 secret 的 unused 函式。
 *
 * 重點：當沒有任何模組 import 這個檔，bundler 連碰都不會碰它——整個檔案
 * 連同 side effect、secret、unuse 全部不會進 bundle。
 *
 * 模組邊界 = bundler 信得過的剃刀。
 */

const secretKey = 'SECRET_MARKER_sk-live-1234567890abcdef';

export function unuse() {
  return `UNUSE_METHOD_MARKER — App 不會用到，但用了 secretKey: ${secretKey}`;
}

console.log('[api/unuse] module loaded', { unuse });
