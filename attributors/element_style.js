import { StyleAttributor } from 'parchment';
import { decorateCanAdd, decorateMethodWithKeyName } from './custom_attributor_decorators';
import { getTablePrefix } from '../formats/table/attributors/key_name_map';

export default class ElementStyleAttributor extends StyleAttributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
  }

  static keys(node) {
    const prefix = getTablePrefix(node.tagName);
    return super.keys.call(this, node).map((keyName) => `${prefix}${keyName}`);
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
