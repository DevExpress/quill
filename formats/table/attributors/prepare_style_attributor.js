import OverriddenStyleAttributor from '../../../attributors/style_attributor';
import capitalize from '../../../utils/capitalize';
import { KeyNameType } from '../../../attributors/utils';

export default function prepareStyleAttributor(
  { name, formatName, ...elementConfig },
  prop,
) {
  const [propName, propSubName] = prop.split('-');

  const attrName = `${name}${capitalize(formatName ?? propName)}${propSubName ? capitalize(propSubName) : ''}`;
  const keyName = `${KeyNameType.style}${name}_${prop}`;

  return new OverriddenStyleAttributor(attrName, keyName, elementConfig);
}
