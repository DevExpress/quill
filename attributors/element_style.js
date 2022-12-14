import { StyleAttributor } from 'parchment';
import { decorateCanAdd, decorateMethodWithKeyName } from './custom_attributor_decorators';
import { getKeyNameWithCustomPrefix } from '../formats/table/attributors/custom_attributor_prefix';

export default class ElementStyleAttributor extends StyleAttributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
  }

  static keys(node) {
    return super.keys.call(this, node)
      .map((keyName) => {
        const result = getKeyNameWithCustomPrefix(node.tagName, keyName);
        return result;
      });
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
