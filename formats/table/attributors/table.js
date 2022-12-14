import prepareAttributor from './prepare_attributor';
import prepareStyleAttributor from './prepare_style_attributor';
import { TABLE_ATTRIBUTES, TABLE_STYLES, tableConfig } from './table_config';

export const TABLE_ATTR_ATTRIBUTORS = TABLE_ATTRIBUTES
  .map((attrName) => prepareAttributor(tableConfig, attrName));

export const TABLE_STYLE_ATTRIBUTORS = TABLE_STYLES
  .map((styleName) => prepareStyleAttributor(tableConfig, styleName));

export const TABLE_FORMATS = TABLE_STYLE_ATTRIBUTORS.reduce((result, attributor) => {
  result[attributor.attrName] = attributor;
  return result;
}, {});

export const TABLE_ATTRIBUTORS = [
  ...TABLE_ATTR_ATTRIBUTORS,
  ...TABLE_STYLE_ATTRIBUTORS,
].reduce((result, attributor) => {
  result[attributor.keyName] = attributor;
  return result;
}, {});
