import OverriddenAttributor from '../../../attributors/attributor';
import capitalize from '../../../utils/capitalize';
import { KeyNameType } from '../../../attributors/utils';

export default function prepareAttributor(
  { name, ...elementConfig },
  domAttrName,
) {
  const attrName = `${name}${capitalize(domAttrName)}`;
  const keyName = `${KeyNameType.attribute}${name}_${domAttrName}`;

  return new OverriddenAttributor(attrName, keyName, elementConfig);
}
