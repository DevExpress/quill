import { cellConfig, tableConfig } from './configs';

const allowedTagToMap = configName => (result, tag) => {
  result[tag] = configName;
  return result;
};

const TABLE_KEY_NAME_MAP = {
  ...tableConfig.allowedTags.reduce(allowedTagToMap(tableConfig.name), {}),
  ...cellConfig.allowedTags.reduce(allowedTagToMap(cellConfig.name), {}),
};

export function getTablePrefix(tagName) {
  return TABLE_KEY_NAME_MAP[tagName] ? `${TABLE_KEY_NAME_MAP[tagName]}_` : '';
}

export function removeTablePrefix(keyNameWithPrefix) {
  return keyNameWithPrefix.replace(/([^]*_)/, '');
}
