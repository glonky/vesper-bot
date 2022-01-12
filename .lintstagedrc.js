module.exports = {
  '**/*.{ts,tsx,js}': [
    (filenames) =>`yarn lint --fix --file ${filenames
      .map((file) => file.split(process.cwd())[1])
      .join(' --file ')}`,
    "yarn test:ci --findRelatedTests --coverage=false"
  ],
}