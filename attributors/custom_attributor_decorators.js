import { removeCustomPrefixFromKeyName } from '../formats/table/attributors/custom_attributor_prefix';

export function decorateMethodWithKeyName(method, ...args) {
  const originalKeyName = this.keyName;
  this.keyName = removeCustomPrefixFromKeyName(this.keyName);

  const result = method.call(this, ...args);

  this.keyName = originalKeyName;
  return result;
}

export function decorateCanAdd(originCanAdd, node, value) {
  const isNodeAllowed = this.allowedTags.indexOf(node.tagName) > -1;
  return isNodeAllowed && originCanAdd.call(this, node, value);
}
