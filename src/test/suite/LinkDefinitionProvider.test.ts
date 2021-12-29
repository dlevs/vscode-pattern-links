import * as assert from "assert";
import * as vscode from "vscode";
import { LinkDefinitionProvider } from "../../LinkDefinitionProvider";

suite("LinkDefinitionProvider", () => {
  const document = {
    getText() {
      return "This is my text and the link is FOO-123 and it is in the middle and here is another one FOO-0 that is the end, also BAR-3";
    },
    positionAt() {
      return new vscode.Position(0, 0);
    },
  };

  test("Matches patterns to return links", async () => {
    const links = await new LinkDefinitionProvider(
      "FOO-\\d+",
      "https://example.com/$0"
    ).provideDocumentLinks(document);
    assert.equal(links?.length, 2);
    assert.equal(
      links?.[0].target?.toString(true),
      "https://example.com/FOO-123"
    );
    assert.equal(
      links?.[1].target?.toString(true),
      "https://example.com/FOO-0"
    );
  });

  test("Capture groups work", async () => {
    const links = await new LinkDefinitionProvider(
      "(FOO|BAR)-(\\d+)",
      "https://example.com/$1/$2?foo=bar"
    ).provideDocumentLinks(document);
    assert.equal(links?.length, 3);
    assert.equal(
      links?.[0].target?.toString(true),
      "https://example.com/FOO/123?foo=bar"
    );
    assert.equal(
      links?.[2].target?.toString(true),
      "https://example.com/BAR/3?foo=bar"
    );
  });

  test("Escape characters prevent substitution", async () => {
    const links = await new LinkDefinitionProvider(
      "(FOO|BAR)-(\\d+)",
      "https://example.com/\\$1/$2?foo=bar"
    ).provideDocumentLinks(document);
    assert.equal(links?.length, 3);
    assert.equal(
      links?.[0].target?.toString(true),
      "https://example.com/$1/123?foo=bar"
    );
    assert.equal(
      links?.[2].target?.toString(true),
      "https://example.com/$1/3?foo=bar"
    );
  });

  test("Failed substitutions result in input remaining untouched (not 'undefined' in output)", async () => {
    const links = await new LinkDefinitionProvider(
      "(FOO|BAR)-(\\d+)",
      "https://example.com/$1/$4"
    ).provideDocumentLinks(document);
    assert.equal(links?.length, 3);
    assert.equal(
      links?.[0].target?.toString(true),
      "https://example.com/FOO/$4"
    );
  });
});
