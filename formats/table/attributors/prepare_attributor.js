import ElementAttributor from '../../../attributors/element_attributor';
import capitalize from '../../../utils/capitalize';

export default function prepareAttributor({ name, ...elementConfig }, keyName) {
  const attrName = `${name}${capitalize(keyName)}`;
  return new ElementAttributor(attrName, keyName, elementConfig);
}
