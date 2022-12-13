import ElementStyleAttributor from '../../../attributors/element_style';
import capitalize from '../../../utils/capitalize';

export default function prepareStyleAttributor(
  { name, formatName, ...elementConfig },
  propName,
  subPropName = '',
) {
  const fullName = `${name}_${propName}${subPropName ? `-${subPropName}` : ''}`;
  return new ElementStyleAttributor(
    `${name}${capitalize(formatName ?? propName)}${capitalize(subPropName)}`,
    fullName,
    elementConfig,
  );
}
