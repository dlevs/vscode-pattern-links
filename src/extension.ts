import * as vscode from "vscode";
import { getLinks } from "./getLinks";
import { LinkDefinitionProvider } from "./LinkDefinitionProvider";


// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("decorator sample is activated");

  let timeout: NodeJS.Timer | undefined = undefined;

  // create a decorator type that we use to decorate small numbers
  const decorationType = vscode.window.createTextEditorDecorationType({
    light: {
      // this color will be used in light color themes
      color: "blue",
    },
    dark: {
      // this color will be used in dark color themes
      color: "blue",
    },
  });

  let activeEditor = vscode.window.activeTextEditor;

  const documentSelector = [
    // { scheme: 'file', language: 'markdown' },
    // { scheme: 'file', language: 'mdx' },
    { language: "markdown" },
    { language: "mdx" },
    { language: "typescript" },
  ];
	
	// vscode.languages.registerDefinitionProvider(documentSelector, new LinkDefinitionProvider())
	
  context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider(documentSelector, new LinkDefinitionProvider())
		);


  function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    
    activeEditor.setDecorations(decorationType, getLinks(activeEditor.document));
  }

  function triggerUpdateDecorations(throttle = false) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (throttle) {
      timeout = setTimeout(updateDecorations, 500);
    } else {
      updateDecorations();
    }
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations(true);
      }
    },
    null,
    context.subscriptions
  );
}
