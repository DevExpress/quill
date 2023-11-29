/* eslint-env node */
module.exports = {
  overrides: [{
    files: ['**/*.ts'],
    extends: [
      'devextreme/testcafe',
      'devextreme/typescript',
    ],
    parserOptions: {
      project: ['./test/functional/tsconfig.json'],
    },
    rules: {
      'no-only-tests/no-only-tests': 'error',
    },
  }],
};
