import { StyleAttributor } from 'parchment';

class ElementStyleAttributor extends StyleAttributor {
  constructor(attrName, keyName, options = { allowedTags: [] }) {
    super(attrName, keyName, options);

    this.allowedTags = options.allowedTags ?? [];
  }

  canAdd(node, value) {
    const isNodeAllowed = this.allowedTags.indexOf(node.tagName) > -1;

    return isNodeAllowed && super.canAdd(node, value);
  }
}

export default ElementStyleAttributor;
