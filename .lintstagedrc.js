module.exports = {
  '**/*.ts': [
    (fileNames) => `yarn lint:fix ${fileNames.join(' ')}`,
    "yarn test:ci --findRelatedTests --coverage=false"
  ],
}