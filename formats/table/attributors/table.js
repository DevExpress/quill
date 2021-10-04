import prepareStyleAttributor from './prepare_style_attributor';

const tableConfig = {
  name: 'table',
  allowedTags: ['TABLE', 'TD', 'TH'],
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

const TABLE_FORMATS = {
  tableAlign: TableAlignStyle,
  tableBackgroundColor: TableBackgroundColorStyle,
  tableBorder: TableBorderStyle,
  tableBorderWidth: TableBorderWidthStyle,
  tableBorderColor: TableBorderColorStyle,
};

export {
  TableAlignStyle,
  TableBackgroundColorStyle,
  TableBorderStyle,
  TableBorderWidthStyle,
  TableBorderColorStyle,
  TABLE_FORMATS,
};
