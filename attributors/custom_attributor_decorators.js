import { removeTablePrefix } from '../formats/table/attributors/key_name_map';

export function decorateMethodWithKeyName(method, ...arg) {
  const originKeyName = this.keyName;
  this.keyName = removeTablePrefix(this.keyName);

  const result = method.call(this, ...arg);

  this.keyName = originKeyName;
  return result;
}

export function decorateCanAdd(originCanAdd, node, value) {
  const isNodeAllowed = this.allowedTags.indexOf(node.tagName) > -1;
  return isNodeAllowed && originCanAdd.call(this, node, value);
}
