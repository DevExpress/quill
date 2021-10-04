import prepareStyleAttributor from './prepare_style_attributor';

const tableConfig = {
  name: 'table',
  allowedTags: ['TABLE'],
};

const TableAlignStyle = prepareStyleAttributor(tableConfig, 'float');

const TableBackgroundColorStyle = prepareStyleAttributor(
  tableConfig,
  'background',
  'color',
);

const TableBorderStyle = prepareStyleAttributor(tableConfig, 'border');
const TableBorderWidthStyle = prepareStyleAttributor(
  tableConfig,
  'border',
  'width',
);
const TableBorderColorStyle = prepareStyleAttributor(
  tableConfig,
  'border',
  'color',
);

export {
  TableAlignStyle,
  TableBackgroundColorStyle,
  TableBorderStyle,
  TableBorderWidthStyle,
  TableBorderColorStyle,
};
