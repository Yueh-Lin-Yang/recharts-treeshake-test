export function use() {
  return 'USE_METHOD_MARKER — App 真的會用到的方法';
}

export function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，ESM named export 預期會被 tree-shake 掉';
}
