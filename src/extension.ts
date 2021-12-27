import * as vscode from "vscode";
import { LinkDefinitionProvider } from "./LinkDefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
  const documentSelector = [
    // { scheme: 'file', language: 'markdown' },
    // { scheme: 'file', language: 'mdx' },
    { language: "markdown" },
    { language: "mdx" },
    { language: "typescript" },
  ];

  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      documentSelector,
      new LinkDefinitionProvider()
    )
  );
}
