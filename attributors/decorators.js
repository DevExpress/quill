import {
  getKeyNameWithCustomPrefix,
  removeCustomPrefixFromKeyName,
} from './utils';

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

export function decorateKeys(originKeys, node, keyType) {
  return originKeys(node)
    .map((keyName) => getKeyNameWithCustomPrefix(node.tagName, keyName, keyType));
}
