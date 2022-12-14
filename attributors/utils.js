import { TABLE_KEY_NAME_SET, tableConfig } from '../formats/table/attributors/table_config';
import { cellConfig, TABLE_CELL_KEY_NAME_SET } from '../formats/table/attributors/cell_config';

export const KeyNameType = {
  attribute: 'attr',
  style: 'style',
};

const OVERRIDDEN_ATTRIBUTORS_TAG_INFO = {
  ...tableConfig.allowedTags.reduce((result, tag) => {
    result[tag] = {
      name: tableConfig.name,
      keyNamesSet: TABLE_KEY_NAME_SET,
    };
    return result;
  }, {}),
  ...cellConfig.allowedTags.reduce((result, tag) => {
    result[tag] = {
      name: cellConfig.name,
      keyNamesSet: TABLE_CELL_KEY_NAME_SET,
    };
    return result;
  }, {}),
};

export function getKeyNameWithCustomPrefix(tagName, keyName, keyType) {
  const tagInfo = OVERRIDDEN_ATTRIBUTORS_TAG_INFO[tagName];

  if (!tagInfo) {
    return keyName;
  }

  return tagInfo.keyNamesSet.has(keyName) ? `${keyType}${tagInfo.name}_${keyName}` : keyName;
}

export function removeCustomPrefixFromKeyName(keyNameWithPrefix) {
  return keyNameWithPrefix.replace(/([^]*_)/, '');
}
