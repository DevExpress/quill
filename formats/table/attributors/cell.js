import prepareAttributor from './prepare_attributor';
import prepareStyleAttributor from './prepare_style_attributor';
import { cellConfig, TABLE_CELL_ATTRIBUTES, TABLE_CELL_STYLES } from './cell_config';

export const TABLE_CELL_ATTR_ATTRIBUTORS = TABLE_CELL_ATTRIBUTES
  .map((attrName) => prepareAttributor(cellConfig, attrName));

export const TABLE_CELL_STYLE_ATTRIBUTORS = TABLE_CELL_STYLES
  .map((styleName) => prepareStyleAttributor(cellConfig, styleName));

export const CELL_FORMATS = TABLE_CELL_STYLE_ATTRIBUTORS.reduce((result, attributor) => {
  result[attributor.attrName] = attributor;
  return result;
}, {});

export const CELL_ATTRIBUTORS = [
  ...TABLE_CELL_ATTR_ATTRIBUTORS,
  ...TABLE_CELL_STYLE_ATTRIBUTORS,
].reduce((result, attributor) => {
  result[attributor.keyName] = attributor;
  return result;
}, {});
