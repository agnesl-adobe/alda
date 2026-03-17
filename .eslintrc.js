module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'consistent-return': 'off',
    'import/extensions': ['error', { js: 'always' }],
    'import/no-unresolved': 'off',
    'linebreak-style': ['error', 'unix'],
    'no-case-declarations': 'off',
    'no-param-reassign': [2, { props: false }],
    'no-underscore-dangle': 'off',
  },
};
