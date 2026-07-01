module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: ['dist', 'node_modules', 'coverage'],
  rules: {}
};
