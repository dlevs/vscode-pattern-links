import * as vscode from "vscode";

export class LinkDefinitionProvider implements vscode.DocumentLinkProvider {
  private pattern: string;
  private targetTemplate: string;

  constructor(pattern: string, targetTemplate: string) {
    this.pattern = pattern;
    this.targetTemplate = targetTemplate;

    console.log("`LinkDefinitionProvider` created", this);
  }

  public provideDocumentLinks(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const regEx = new RegExp(this.pattern, "g");
    const text = document.getText();
    const links: vscode.DecorationOptions[] = [];

    let match: RegExpExecArray | null;
    while ((match = regEx.exec(text))) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);
      const url = this.targetTemplate.replace(
        /\$(\d)/g,
        (indexMatch, index) => {
          // TODO: Document
          return (match as RegExpExecArray)[Number(index)];
        }
      );
      console.log("url", url);
      const decoration: vscode.DocumentLink = {
        range,
        target: vscode.Uri.parse(url, true),
      };
      links.push(decoration);
    }

    return links;
  }
}
