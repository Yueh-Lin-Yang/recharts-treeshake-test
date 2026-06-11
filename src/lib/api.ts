function use() {
  return 'USE_METHOD_MARKER — App 真的會用到的方法';
}

function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，但 export default 物件無法 tree-shake，所以還是會進 bundle';
}

export default { use, unuse };
