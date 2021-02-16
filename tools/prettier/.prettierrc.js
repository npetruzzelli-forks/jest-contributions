module.exports = {
  // Prettier Config consistent with JavaScript Standard Style (JSS)
  bracketSpacing: true,
  printWidth: 80,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none', // JSS = none, Prettier 2 default = es5
  useTabs: false,

  // Config options that JSS has no explicit opinion on
  arrowParens: 'always',
  htmlWhitespaceSensitivity: 'css',
  jsxBracketSameLine: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  vueIndentScriptAndStyle: true,

  // End of Line
  // "lf" is ok for most Windows files and modern editors. Configure version
  // control and file formatters consistently to avoid noisy commits. Formats
  // that are sensitive to "crlf" can use an overrides entry if needed.
  endOfLine: 'lf',

  // Overrides for specific files and types
  overrides: [
    {
      // Force indentation settings for these files, just in case an extended
      // config changes the default.
      files: ['bower.json', 'package.json', 'package-lock.json', 'yarn.lock'],
      options: {
        // Bower, npm, and Yarn CLIs use 2 spaces as indentation when updating
        // files.
        tabWidth: 2,
        useTabs: false
      }
    }
  ]
}
