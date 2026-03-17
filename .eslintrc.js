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
    'consistent-return': 'off', // async functions often have early returns
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'import/no-unresolved': 'off', // conflicts with dynamic imports and external URLs
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'no-underscore-dangle': 'off', // DA and other libs use __ prefixed globals
  },
};
