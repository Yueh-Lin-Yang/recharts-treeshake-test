export function use() {
  return 'USE_METHOD_MARKER — App 真的會用到的方法';
}

export function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，但 runtime 決定 key 會讓它仍進 bundle';
}
