import { Attributor } from 'parchment';
import { decorateCanAdd, decorateKeys, decorateMethodWithKeyName } from './decorators';
import { KeyNameType } from './utils';

export default class OverriddenAttributor extends Attributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
  }

  static keys(node) {
    return decorateKeys(super.keys, node, KeyNameType.attribute);
  }

  add(node, value) {
    return decorateMethodWithKeyName.call(this, super.add, node, value);
  }

  remove(node) {
    return decorateMethodWithKeyName.call(this, super.remove, node);
  }

  value(node) {
    return decorateMethodWithKeyName.call(this, super.value, node);
  }

  canAdd(node, value) {
    return decorateCanAdd.call(this, super.canAdd, node, value);
  }
}
