/*
 * 純宣告模組：只放 export，不放任何頂層執行語句。
 * Bundler 可以精準剃除任何沒被 import 的 export。
 */

export function use() {
  return 'USE_METHOD_MARKER — App 真的會用到的方法';
}

const secretKey = 'SECRET_MARKER_sk-live-1234567890abcdef';

export function unuse() {
  return `UNUSE_METHOD_MARKER — App 不會用到，但用了 secretKey: ${secretKey}`;
}
