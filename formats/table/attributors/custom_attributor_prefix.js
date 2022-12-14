import { TABLE_ATTRIBUTES, TABLE_STYLES, tableConfig } from './table_config';
import { cellConfig, TABLE_CELL_ATTRIBUTES, TABLE_CELL_STYLES } from './cell_config';

const buildTagInfo = (name, keyNamesSet) => (result, tag) => {
  result[tag] = {
    name,
    keyNamesSet,
  };
  return result;
};

const CUSTOM_ATTRIBUTERS_TAG_INFO = {
  ...tableConfig.allowedTags.reduce(buildTagInfo(tableConfig.name, new Set([
    ...TABLE_ATTRIBUTES,
    ...TABLE_STYLES,
  ])), {}),
  ...cellConfig.allowedTags.reduce(buildTagInfo(cellConfig.name, new Set([
    ...TABLE_CELL_ATTRIBUTES,
    ...TABLE_CELL_STYLES,
  ])), {}),
};

export function getKeyNameWithCustomPrefix(tagName, keyName) {
  const tagInfo = CUSTOM_ATTRIBUTERS_TAG_INFO[tagName];

  if (!tagInfo) {
    return keyName;
  }

  return tagInfo.keyNamesSet.has(keyName) ? `${tagInfo.name}_${keyName}` : keyName;
}

export function removeCustomPrefixFromKeyName(keyNameWithPrefix) {
  return keyNameWithPrefix.replace(/([^]*_)/, '');
}
