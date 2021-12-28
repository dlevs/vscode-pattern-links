![Pattern links icon](./assets/icon.png)

# Pattern Links

**Pattern Links** is a plugin that automatically turns text into links based upon a regex pattern. Here's how it looks:

![Animated gif showing a code comment that has a link that can be clicked](./assets/usage.gif)

In the example above, the text `ISSUE-299` was automatically turned into a link by using the following config in VS Code:

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

## Development setup

1. `npm install` to initialize the project
2. `npm run watch` to start the compiler in watch mode
3. Open this folder in VS Code and start the debugger (`F5`).

## Usage

See [the usage document](./USAGE.md).
