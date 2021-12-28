<img src="assets/icon.png" alt="Pattern links icon" width="120"/>

# Pattern Links

**Pattern Links** is a plugin that automatically turns text into links based upon a regex pattern. Here's how it looks:

![Animated gif showing a code comment that has a link that can be clicked](assets/usage.gif)

In the example above, the text `ISSUE-299` was automatically turned into a link by using the following configuration in VS Code:

```json
{
  "patternlinks.rules": [
    {
      "linkPattern": "ISSUE-\\d+",
      "linkTarget": "https://myorg.atlassian.net/browse/$0"
    }
  ]
}
```

## Contributing

1. Clone this repository
2. `npm install` to install dependencies
3. `npm run watch` to start the compiler in watch mode
4. Open this folder in VS Code and start the debugger (`F5`).
