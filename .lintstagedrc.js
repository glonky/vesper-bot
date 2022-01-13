module.exports = {
  '**/*.ts': [
    (fileNames) => `yarn eslint --cache --fix ${fileNames.join(' ')}`,
    "yarn test:ci --findRelatedTests --coverage=false"
  ],
}