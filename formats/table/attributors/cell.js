import prepareStyleAttributor from './prepare_style_attributor';

const cellConfig = {
  name: 'cell',
  allowedTags: ['TH', 'TD'],
};

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
