import * as vscode from "vscode";
import { getLinks } from "./getLinks";

export class LinkDefinitionProvider implements vscode.DocumentLinkProvider {
  public provideDocumentLinks(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.ProviderResult<vscode.DocumentLink[]> {
		return getLinks(document);
	}
}
