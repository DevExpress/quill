/* eslint-env node */
module.exports = {
  overrides: [
    {
      files: ['*.ts'],
      excludedFiles: ['*.d.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        createDefaultProgram: true,
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 6,
        sourceType: 'module',
      },
      extends: ['devextreme/typescript'],
    },
  ],
};
