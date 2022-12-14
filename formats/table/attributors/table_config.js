export const tableConfig = {
  name: 'table',
  allowedTags: ['TABLE'],
};

export const TABLE_ATTRIBUTES = [
  'height',
  'width',
];

export const TABLE_STYLES = [
  'height',
  'width',
  'text-align',
  'background-color',
  'border',
  'border-style',
  'border-width',
  'border-color',
];

export const TABLE_KEY_NAME_SET = new Set([
  ...TABLE_ATTRIBUTES,
  ...TABLE_STYLES,
]);
