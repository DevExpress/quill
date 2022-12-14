import ElementStyleAttributor from '../../../attributors/element_style';
import capitalize from '../../../utils/capitalize';

export default function prepareStyleAttributor(
  { name, formatName, ...elementConfig },
  prop,
) {
  const [propName, propSubName] = prop.split('-');

  const attrName = `${name}${capitalize(formatName ?? propName)}${
    propSubName ? capitalize(propSubName) : ''
  }`;
  const keyName = `${name}_${prop}`;

  return new ElementStyleAttributor(attrName, keyName, elementConfig);
}
