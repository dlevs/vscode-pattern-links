import * as vscode from "vscode";
import { LinkDefinitionProvider } from "./LinkDefinitionProvider";
import { Config } from "./types";

const EXTENSION_NAME = "patternlinks";

let activeRules: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext): void {
  initFromConfig(context);

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(EXTENSION_NAME)) {
      initFromConfig(context);
    }
  });
}

function initFromConfig(context: vscode.ExtensionContext): void {
  const config = vscode.workspace
    .getConfiguration()
    .get(EXTENSION_NAME) as Config;

  for (const rule of activeRules) {
    rule.dispose();
  }

  activeRules = config.rules.map((rule) => {
    return vscode.languages.registerDocumentLinkProvider(
      [{ scheme: "file", pattern: rule.filePattern || undefined }],
      new LinkDefinitionProvider(rule.linkPattern, rule.linkTarget)
    );
  });

  for (const rule of activeRules) {
    context.subscriptions.push(rule);
  }
}
