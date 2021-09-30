import ElementStyleAttributor from '../../../attributors/element_style';
import capitalize from '../../../utils/capitalize';

const cellConfig = {
  allowedTags: ['TH', 'TD', 'TABLE'],
};

function prepareStyleAttributor(propName, subPropName = '') {
  const fullName = `${propName}${subPropName ? `-${subPropName}` : ''}`;
  return new ElementStyleAttributor(
    `table${capitalize(propName)}${capitalize(subPropName)}`,
    fullName,
    cellConfig,
  );
}

const CellVerticalAlignStyle = prepareStyleAttributor('vertical', 'align');

const CellBackgroundColorStyle = prepareStyleAttributor('background', 'color');

const CellBorderStyle = prepareStyleAttributor('border');
const CellBorderWidthStyle = prepareStyleAttributor('border', 'width');
const CellBorderColorStyle = prepareStyleAttributor('border', 'color');

const CellPaddingStyle = prepareStyleAttributor('padding');
const CellPaddingTopStyle = prepareStyleAttributor('padding', 'top');
const CellPaddingBottomStyle = prepareStyleAttributor('padding', 'bottom');
const CellPaddingLeftStyle = prepareStyleAttributor('padding', 'left');
const CellPaddingRightStyle = prepareStyleAttributor('padding', 'right');

export {
  CellVerticalAlignStyle,
  CellBackgroundColorStyle,
  CellBorderStyle,
  CellBorderWidthStyle,
  CellBorderColorStyle,
  CellPaddingStyle,
  CellPaddingTopStyle,
  CellPaddingBottomStyle,
  CellPaddingLeftStyle,
  CellPaddingRightStyle,
};
