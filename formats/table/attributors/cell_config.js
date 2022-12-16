export const cellConfig = {
  name: 'cell',
  allowedTags: ['TH', 'TD', 'TR'],
};

export const TABLE_CELL_ATTRIBUTES = [
  'height',
  'width',
];

export const TABLE_CELL_STYLES = [
  'height',
  'width',
  'vertical-align',
  'text-align',
  'background-color',
  'border',
  'border-style',
  'border-width',
  'border-color',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
];

export const TABLE_CELL_KEY_NAME_SET = new Set([
  ...TABLE_CELL_ATTRIBUTES,
  ...TABLE_CELL_STYLES,
]);
