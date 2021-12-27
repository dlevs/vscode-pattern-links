import * as vscode from "vscode";

export class LinkDefinitionProvider implements vscode.DocumentLinkProvider {
  public provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const regEx = /FOO-\d+/g;
    const text = document.getText();
    const links: vscode.DecorationOptions[] = [];

    let match;
    while ((match = regEx.exec(text))) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const decoration: vscode.DocumentLink = {
        range: new vscode.Range(startPos, endPos),
        target: vscode.Uri.parse(
          `https://www.google.com/search?q=${match[0]}`,
          true
        ),
      };
      links.push(decoration);
    }

    return links;
  }
}
