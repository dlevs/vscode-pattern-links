import * as vscode from "vscode";
import * as config from "./config";
import {
  PatternDocumentLinkProvider,
  PatternTerminalLinkProvider,
} from "./PatternLinkProviders";

let activeProviders: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext): void {
  configureFromRules(context);

  let configurationChangeHandle = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration(config.EXTENSION_NAME)) {
        configureFromRules(context);
      }
    }
  );
  context.subscriptions.push(configurationChangeHandle);
}

function configureFromRules(context: vscode.ExtensionContext): void {
  for (const provider of activeProviders) {
    provider.dispose();
  }
  activeProviders = [];

  const rules = config.getRules();
  const allLanguages = rules.flatMap((rule) => rule.languages ?? []);

  for (const lang of allLanguages) {
    let theseRules = rules.filter((rule) =>
      (rule.languages ?? []).includes(lang)
    );
    let lp = new PatternDocumentLinkProvider(theseRules);
    let handle = vscode.languages.registerDocumentLinkProvider(
      { language: lang },
      lp
    );

    activeProviders.push(handle);
  }

  if (rules.some((r) => r.terminal)) {
    let terminalRules = rules.filter((rule) => !!rule.terminal);
    let tp = new PatternTerminalLinkProvider(terminalRules);
    let handle = vscode.window.registerTerminalLinkProvider(tp);

    activeProviders.push(handle);
  }

  context.subscriptions.push(...activeProviders);
}
