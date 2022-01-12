module.exports = {
  '**/*.ts': [
    'yarn lint:fix',
    "yarn test:ci --findRelatedTests --coverage=false"
  ],
}