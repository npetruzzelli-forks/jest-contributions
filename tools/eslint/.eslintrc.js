const mainrc = require('./main.eslintrc')

const typescriptOverrideFiles = '**/*.ts?(x)'
const typescriptOverride = mainrc.overrides.find((override) => {
  return override.files === typescriptOverrideFiles
})

module.exports = {
  // ORDER IS IMPORTANT
  extends: [
    // JavaScript Standard Style will configure anything that we don't have an
    // explicit opinion on.
    'standard',

    './main.eslintrc.js',

    // MUST BE LAST. Disable rules that could conflict with Prettier.
    'prettier',
    'prettier/standard',
    'prettier/babel',
  ],
  // Preserve rules that are carefully set with Prettier in mind
  rules: {
    'babel/quotes':mainrc.rules['babel/quotes']
  },
  overrides: [
    {
      files: typescriptOverrideFiles,
      extends: ['prettier/@typescript-eslint'],
      rules: {
        '@typescript-eslint/quotes':
          typescriptOverride.rules['@typescript-eslint/quotes']
      }
    }
  ]
}
