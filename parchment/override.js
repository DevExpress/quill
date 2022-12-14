import {
  AttributorStore,
  Registry,
  Attributor,
  ClassAttributor,
  StyleAttributor,
  Scope,
} from 'parchment';
import {
  getKeyNameWithCustomPrefix,
  KeyNameType,
} from '../attributors/utils';

function fillAttributes(tagName, blot, keyNames, keyType) {
  return keyNames.map((keyName) => {
    const normalizedKeyName = keyType
      ? getKeyNameWithCustomPrefix(tagName, keyName, keyType)
      : keyName;
    return blot.scroll.query(normalizedKeyName, Scope.ATTRIBUTE);
  }).filter((attributor) => attributor instanceof Attributor)
    .reduce((result, attributor) => {
      result[attributor.attrName] = attributor;
      return result;
    }, {});
}

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

    this.attributes = {
      ...fillAttributes(tagName, blot, attributes, KeyNameType.attribute),
      ...fillAttributes(tagName, blot, classes),
      ...fillAttributes(tagName, blot, styles, KeyNameType.style),
    };
  };
}
