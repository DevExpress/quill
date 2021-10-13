import prepareAttributor from './prepare_attributor';
import prepareStyleAttributor from './prepare_style_attributor';

const tableConfig = {
  name: 'table',
  allowedTags: ['TABLE'],
};

const TableHeightAttribute = prepareAttributor(tableConfig, 'height');
const TableWidthAttribute = prepareAttributor(tableConfig, 'width');
const TableHeightStyle = prepareStyleAttributor(tableConfig, 'height');
const TableWidthStyle = prepareStyleAttributor(tableConfig, 'width');

const TableTextAlignStyle = prepareStyleAttributor(
  tableConfig,
  'text',
  'align',
);

const TableBackgroundColorStyle = prepareStyleAttributor(
  tableConfig,
  'background',
  'color',
);

const TableBorderStyle = prepareStyleAttributor(tableConfig, 'border');
const TableBorderStyleStyle = prepareStyleAttributor(
  tableConfig,
  'border',
  'style',
);
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

const TABLE_FORMATS = {
  tableTextAlign: TableTextAlignStyle,
  tableBackgroundColor: TableBackgroundColorStyle,
  tableBorder: TableBorderStyle,
  tableBorderStyle: TableBorderStyleStyle,
  tableBorderWidth: TableBorderWidthStyle,
  tableBorderColor: TableBorderColorStyle,
  tableWidth: TableWidthStyle,
  tableHeight: TableHeightStyle,
};

const TABLE_ATTRIBUTORS = [
  TableTextAlignStyle,
  TableBackgroundColorStyle,
  TableBorderStyle,
  TableBorderStyleStyle,
  TableBorderColorStyle,
  TableBorderWidthStyle,
  TableHeightStyle,
  TableWidthStyle,
  TableWidthAttribute,
  TableHeightAttribute,
].reduce((memo, attr) => {
  memo[attr.keyName] = attr;
  return memo;
}, {});

export {
  TableTextAlignStyle,
  TableBackgroundColorStyle,
  TableBorderStyle,
  TableBorderStyleStyle,
  TableBorderWidthStyle,
  TableBorderColorStyle,
  TableHeightStyle,
  TableWidthStyle,
  TableWidthAttribute,
  TableHeightAttribute,
  TABLE_FORMATS,
  TABLE_ATTRIBUTORS,
};
