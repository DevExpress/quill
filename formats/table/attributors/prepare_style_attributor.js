import ElementStyleAttributor from '../../../attributors/element_style';
import capitalize from '../../../utils/capitalize';

export default function prepareStyleAttributor(
  { name, ...elementConfig },
  propName,
  subPropName = '',
) {
  const fullName = `${propName}${subPropName ? `-${subPropName}` : ''}`;
  return new ElementStyleAttributor(
    `${name}${capitalize(propName)}${capitalize(subPropName)}`,
    fullName,
    elementConfig,
  );
}
