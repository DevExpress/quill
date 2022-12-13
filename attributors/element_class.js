import { ClassAttributor } from 'parchment';
import { decorateCanAdd, decorateMethodWithKeyName } from './custom_attributor_decorators';

export default class ElementClassAttributor extends ClassAttributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
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
