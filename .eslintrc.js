module.exports = {
  root: true,
  env: {
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
  },
  ignorePatterns: ["webpack.config.js"],
  rules: {
    "no-async-promise-executor": "off",
    "indent": [
      "error",
      2
    ],
    "quotes": [
      "error",
      "double",
      "avoid-escape"
    ],
    "semi": [
      "error",
      "always"
    ],
    "object-curly-spacing": [
      "error", 
      "always"
    ],
    "no-warning-comments": [
      1, { 
        "terms": [
          "todo", 
          "change",
          "fixme", 
          "fix",
          "bug", 
          "buggy",
        ],
        "location": "anywhere",
      }
    ]
  }
};