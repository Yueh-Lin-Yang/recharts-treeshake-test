function unuse() {
  return 'UNUSE_METHOD_MARKER — App 不會用到，但因為 index.cjs 用 require 聚合，所以還是會進 bundle';
}

module.exports = { unuse };
