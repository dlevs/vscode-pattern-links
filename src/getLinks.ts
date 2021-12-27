import * as vscode from "vscode";

export function getLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
  const regEx = /FOO-\d+/g;
  const text = document.getText();
  let match;
  const links: vscode.DecorationOptions[] = [];
  while ((match = regEx.exec(text))) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    const decoration: vscode.DocumentLink = {
      range: new vscode.Range(startPos, endPos),
      target: vscode.Uri.parse(
        `https://www.google.com/search?q=${match[0]}`,
        true
      ),
			
        // hoverMessage: "Go to issue **" + match[0] + "**",
    };
    links.push(decoration);
  }

  return links;
}
