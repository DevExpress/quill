import prepareAttributor from './prepare_attributor';
import prepareStyleAttributor from './prepare_style_attributor';

const cellConfig = {
  name: 'cell',
  allowedTags: ['TH', 'TD'],
};

const CellHeightAttribute = prepareAttributor(cellConfig, 'height');
const CellWidthAttribute = prepareAttributor(cellConfig, 'width');

const CellVerticalAlignStyle = prepareStyleAttributor(
  cellConfig,
  'vertical',
  'align',
);

const CellBackgroundColorStyle = prepareStyleAttributor(
  cellConfig,
  'background',
  'color',
);

const CellBorderStyle = prepareStyleAttributor(cellConfig, 'border');
const CellBorderStyleStyle = prepareStyleAttributor(
  cellConfig,
  'border',
  'style',
);
const CellBorderWidthStyle = prepareStyleAttributor(
  cellConfig,
  'border',
  'width',
);
const CellBorderColorStyle = prepareStyleAttributor(
  cellConfig,
  'border',
  'color',
);

const CellPaddingStyle = prepareStyleAttributor(cellConfig, 'padding');
const CellPaddingTopStyle = prepareStyleAttributor(
  cellConfig,
  'padding',
  'top',
);
const CellPaddingBottomStyle = prepareStyleAttributor(
  cellConfig,
  'padding',
  'bottom',
);
const CellPaddingLeftStyle = prepareStyleAttributor(
  cellConfig,
  'padding',
  'left',
);
const CellPaddingRightStyle = prepareStyleAttributor(
  cellConfig,
  'padding',
  'right',
);

const CELL_FORMATS = {
  cellBorder: CellBorderStyle,
  cellBorderStyle: CellBorderStyleStyle,
  cellBorderWidth: CellBorderWidthStyle,
  cellBorderColor: CellBorderColorStyle,
  cellBackgroundColor: CellBackgroundColorStyle,
  cellPadding: CellPaddingStyle,
  cellPaddingTop: CellPaddingTopStyle,
  cellPaddingBottom: CellPaddingBottomStyle,
  cellPaddingLeft: CellPaddingLeftStyle,
  cellPaddingRight: CellPaddingRightStyle,
  cellVerticalAlign: CellVerticalAlignStyle,
  cellWidth: CellWidthAttribute,
  cellHeight: CellHeightAttribute,
};

const CELL_ATTRIBUTORS = [
  CellBackgroundColorStyle,
  CellBorderColorStyle,
  CellBorderStyle,
  CellBorderStyleStyle,
  CellBorderWidthStyle,
  CellPaddingBottomStyle,
  CellPaddingLeftStyle,
  CellPaddingRightStyle,
  CellPaddingStyle,
  CellPaddingTopStyle,
  CellVerticalAlignStyle,
  CellWidthAttribute,
  CellHeightAttribute,
].reduce((memo, attr) => {
  memo[attr.keyName] = attr;
  return memo;
}, {});

export {
  CellVerticalAlignStyle,
  CellBackgroundColorStyle,
  CellBorderStyle,
  CellBorderStyleStyle,
  CellBorderWidthStyle,
  CellBorderColorStyle,
  CellPaddingStyle,
  CellPaddingTopStyle,
  CellPaddingBottomStyle,
  CellPaddingLeftStyle,
  CellPaddingRightStyle,
  CellHeightAttribute,
  CellWidthAttribute,
  CELL_FORMATS,
  CELL_ATTRIBUTORS,
};
