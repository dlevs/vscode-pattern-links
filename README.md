# Pattern Links

**Pattern Links** is a plugin that automatically turns text into links based upon regex patterns.

![Animated gif showing a code comment that has a link that can be clicked](assets/usage.gif)

## Configuration

Multiple patterns can be defined in your VS Code settings. The following examples highlight common use cases.

```js
{
  "patternlinks.rules": [
    {
      "linkPattern": "ISSUE-\\d+",
      "linkTarget": "https://myorg.atlassian.net/browse/$0",
      "filePattern": "**/*.{md,txt}" // Only markdown and plain text files
      // Example URL: https://myorg.atlassian.net/browse/ISSUE-299
    },
    {
      "linkPattern": "(FOO|BAR)-(\\d+)",
      "linkTarget": "https://example.com/$1/$2"
      // Example URL: https://example.com/FOO/123
    },
    {
      "linkPattern": "SKU([A-Z_]+)",
      "linkTarget": "https://shop.com?search=$1&min-price=\\$1"
      // Example URL: https://shop.com?search=PRODUCT_CODE&min-price=$1
      // Here, `\` is being used as an escape character to prevent substitution
      // of the second `$1`.
    }
  ]
}
```

## Contributing

1. Clone this repository
2. `npm install` to install dependencies
3. `npm run watch` to start the compiler in watch mode
4. Open this folder in VS Code and start the debugger (`F5`).
