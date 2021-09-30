import { Attributor } from 'parchment';

class ElementAttributor extends Attributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
  }

  canAdd(node, value) {
    const isNodeAllowed = this.allowedTags.indexOf(node.tagName) > -1;

    return isNodeAllowed && super.canAdd(node, value);
  }
}

export default ElementAttributor;
