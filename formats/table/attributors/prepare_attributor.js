import ElementAttributor from '../../../attributors/element_attributor';
import capitalize from '../../../utils/capitalize';

export default function prepareAttributor(
  { name, ...elementConfig },
  attrName,
) {
  return new ElementAttributor(
    `${name}${capitalize(attrName)}`,
    attrName,
    elementConfig,
  );
}
