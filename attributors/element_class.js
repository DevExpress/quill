import { ClassAttributor } from 'parchment';

class ElementClassAttributor extends ClassAttributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
  }

  canAdd(node, value) {
    const isNodeAllowed = this.allowedTags.indexOf(node.tagName) > -1;

    return isNodeAllowed && super.canAdd(node, value);
  }
}

export default ElementClassAttributor;
