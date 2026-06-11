function use() {
  return 'USE_METHOD_MARKER — 這是 App 真的會用到的方法';
}

function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，但 CJS 沒辦法 tree-shake，所以還是會進 bundle';
}

module.exports = { use, unuse };
