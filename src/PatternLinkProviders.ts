import * as vscode from "vscode";
import { Rule, MultiRuleMatcher, PatternMatchArray } from "./rule";

export class PatternDocumentLinkProvider
  extends MultiRuleMatcher
  implements vscode.DocumentLinkProvider
{
  public provideDocumentLinks(
    document: vscode.TextDocument
  ): vscode.DocumentLink[] {
    const text = document.getText();
    const links: vscode.DecorationOptions[] = [];

    this.forEachMatch(text, (rule: Rule, match: PatternMatchArray) => {
      const matchText = match[0];
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + matchText.length);
      const linkRange = new vscode.Range(startPos, endPos);

      const urlString = MultiRuleMatcher.interpolateRule(rule, match);

      const thisLink = new vscode.DocumentLink(
        linkRange,
        vscode.Uri.parse(urlString)
      );
      thisLink.tooltip = urlString;
      links.push(thisLink);
    });

    return links;
  }
}

class PatternTerminalLink extends vscode.TerminalLink {
  target: vscode.Uri;

  constructor(startIndex: number, length: number, target: vscode.Uri) {
    super(startIndex, length, target.toString());
    this.target = target;
  }
}

export class PatternTerminalLinkProvider
  extends MultiRuleMatcher
  implements vscode.TerminalLinkProvider<PatternTerminalLink>
{
  provideTerminalLinks(
    context: vscode.TerminalLinkContext,
    _token: vscode.CancellationToken
  ): PatternTerminalLink[] {
    const text = context.line;
    const links: PatternTerminalLink[] = [];

    this.forEachMatch(text, (rule: Rule, match: PatternMatchArray) => {
      const matchText = match[0];
      const urlString = PatternTerminalLinkProvider.interpolateRule(
        rule,
        match
      );
      const thisLink = new PatternTerminalLink(
        match.index,
        matchText.length,
        vscode.Uri.parse(urlString)
      );
      links.push(thisLink);
    });

    return links;
  }

  handleTerminalLink(link: PatternTerminalLink): vscode.ProviderResult<void> {
    return vscode.commands.executeCommand("vscode.open", link.target);
  }
}
