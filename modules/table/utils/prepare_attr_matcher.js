import { Scope } from 'parchment';
import OverriddenAttributor from '../../../attributors/attributor';
import OverriddenStyleAttributor from '../../../attributors/style_attributor';
import { applyFormat } from '../../clipboard';

function writeToRecord(record, key, value, override) {
  record[key] = !override && record[key] ? record[key] : value;
}

function fillFormats(attributes, node, scroll, attributors, result, override) {
  attributes
    .filter((name) => !!name)
    .forEach((name) => {
      const queryAttr = scroll.query(name, Scope.ATTRIBUTE);
      if (queryAttr !== null) {
        const queryAttrValue = queryAttr.value(node);
        if (queryAttrValue) {
          writeToRecord(result, queryAttr.attrName, queryAttrValue, override);
          return;
        }
      }

      const attr = attributors[name];
      if (attr != null && (attr.attrName === name || attr.keyName === name)) {
        const attrValue = attr.value(node) || undefined;
        writeToRecord(result, attr.attrName, attrValue, override);
      }
    });

  return result;
}

export function prepareAttributeMatcher(attributors) {
  return (node, delta, scroll) => {
    const attributes = OverriddenAttributor.keys(node);
    const styles = OverriddenStyleAttributor.keys(node);

    const formats = {
      ...fillFormats(attributes, node, scroll, attributors, {}, true),
      ...fillFormats(styles, node, scroll, attributors, {}, true),
    };

    if (Object.keys(formats).length > 0) {
      return applyFormat(delta, formats);
    }
    return delta;
  };
}

export function prepareCellAttributeMatcher(attributors) {
  return (node, delta, scroll) => {
    const attributes = OverriddenAttributor.keys(node);
    const styles = OverriddenStyleAttributor.keys(node);
    const parentTrNode = node.parentNode?.tagName === 'TR' ? node.parentNode : undefined;

    let formats = {
      ...fillFormats(attributes, node, scroll, attributors, {}, true),
      ...fillFormats(styles, node, scroll, attributors, {}, true),
    };

    if (parentTrNode) {
      const parentStyles = OverriddenStyleAttributor.keys(parentTrNode);
      formats = fillFormats(
        parentStyles,
        parentTrNode,
        scroll,
        attributors,
        formats,
        false,
      );
    }

    if (Object.keys(formats).length > 0) {
      return applyFormat(delta, formats);
    }
    return delta;
  };
}
