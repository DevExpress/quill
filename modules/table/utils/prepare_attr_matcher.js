import { Scope } from 'parchment';
import OverriddenAttributor from '../../../attributors/attributor';
import OverriddenStyleAttributor from '../../../attributors/style_attributor';
import { CELL_ATTRIBUTORS } from '../../../formats/table/attributors/cell';
import { TABLE_ATTRIBUTORS } from '../../../formats/table/attributors/table';
import { applyFormat } from '../../clipboard';

const ATTRIBUTORS = {
  table: TABLE_ATTRIBUTORS,
  cell: CELL_ATTRIBUTORS,
};

export default function prepareAttributeMatcher(type) {
  const attributors = ATTRIBUTORS[type];
  return (node, delta, scroll) => {
    const attributes = OverriddenAttributor.keys(node);
    const styles = OverriddenStyleAttributor.keys(node);
    const formats = {};
    attributes.concat(styles).forEach((name) => {
      let attr = scroll.query(name, Scope.ATTRIBUTE);
      if (attr != null) {
        formats[attr.attrName] = attr.value(node);
        if (formats[attr.attrName]) return;
      }
      attr = attributors[name];
      if (attr != null && (attr.attrName === name || attr.keyName === name)) {
        attr = attributors[name];
        formats[attr.attrName] = attr.value(node) || undefined;
      }
    });
    if (Object.keys(formats).length > 0) {
      return applyFormat(delta, formats);
    }
    return delta;
  };
}
