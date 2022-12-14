import {
  AttributorStore,
  Registry,
  Attributor,
  ClassAttributor,
  StyleAttributor,
  Scope,
} from 'parchment';
import { getKeyNameWithCustomPrefix } from '../formats/table/attributors/custom_attributor_prefix';

export function overrideParchment() {
  // eslint-disable-next-line no-undef, func-names
  AttributorStore.prototype.build = function () {
    const { tagName } = this.domNode;
    const blot = Registry.find(this.domNode);
    if (blot == null) {
      return;
    }

    const attributes = Attributor.keys(this.domNode);
    const classes = ClassAttributor.keys(this.domNode);
    const styles = StyleAttributor.keys(this.domNode);
    const attributeNames = [...new Set(
      attributes
        .concat(classes)
        .concat(styles),
    )];

    this.attributes = {};
    attributeNames
      .forEach((keyName) => {
        const keyNameWithPrefix = getKeyNameWithCustomPrefix(tagName, keyName);
        const attr = blot.scroll.query(keyNameWithPrefix, Scope.ATTRIBUTE);

        if (attr instanceof Attributor) {
          this.attributes[attr.attrName] = attr;
        }
      });
  };
}
