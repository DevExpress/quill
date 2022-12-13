import {
  AttributorStore,
  Registry,
  Attributor,
  ClassAttributor,
  StyleAttributor,
  Scope,
} from 'parchment';
import { getTablePrefix } from '../formats/table/attributors/key_name_map';

export function overrideParchment() {
  // eslint-disable-next-line no-undef, func-names
  AttributorStore.prototype.build = function () {
    this.attributes = {};
    const blot = Registry.find(this.domNode);
    if (blot == null) {
      return;
    }
    const attributes = Attributor.keys(this.domNode);
    const classes = ClassAttributor.keys(this.domNode);
    const styles = StyleAttributor.keys(this.domNode);
    const prefix = getTablePrefix();

    attributes
      .concat(classes)
      .concat(styles)
      .forEach((name) => {
        const attr = blot.scroll.query(`${prefix}${name}`, Scope.ATTRIBUTE);
        if (attr instanceof Attributor) {
          this.attributes[attr.attrName] = attr;
        }
      });
  };
}
