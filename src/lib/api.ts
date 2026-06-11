export function use() {
  return 'USE_METHOD_MARKER — App 真的會用到的方法';
}

export function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，但動態 key 存取會讓它仍進 bundle';
}
