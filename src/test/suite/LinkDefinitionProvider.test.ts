import * as assert from "assert";

import {
  Rule,
  UncompiledRegExp,
  PatternMatchArray,
  MultiRuleMatcher,
} from "../../rule";

interface TestLink {
  target: string;
  startIndex: number;
  endIndex: number;
}

class PatternLinkTestProvider extends MultiRuleMatcher {
  public provideLinks(text: string): TestLink[] {
    const links: TestLink[] = [];

    this.forEachMatch(text, (rule: Rule, match: PatternMatchArray) => {
      const thisLink: TestLink = {
        target: MultiRuleMatcher.interpolateRule(rule, match),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      };
      links.push(thisLink);
    });

    return links;
  }
}

suite("PatternDocumentLinkProvider", () => {
  const document =
    "This is my text and the link is FOO-123 and it is in the middle and here is another one FOO-0 that is the end, also BAR-3. And one lowercase one: bar-72 some text. Multiline now STARTsome stuff\nnewline\nandmoreEND.";

  test("Matches patterns to return links", async () => {
    const rule: Rule = {
      linkPattern: new UncompiledRegExp("FOO-\\d+"),
      linkTarget: "https://example.com/$0",
    };

    const links = new PatternLinkTestProvider([rule]).provideLinks(document);
    assert.equal(links.length, 2);
    assert.equal(links[0].target, "https://example.com/FOO-123");
    assert.equal(links[0].startIndex, 32);
    assert.equal(links[0].endIndex, 39);
    assert.equal(links[1].target, "https://example.com/FOO-0");
    assert.equal(links[1].startIndex, 88);
    assert.equal(links[1].endIndex, 93);
  });

  test("Capture groups work", async () => {
    const rule: Rule = {
      linkPattern: new UncompiledRegExp("(FOO|BAR)-(\\d+)"),
      linkTarget: "https://example.com/$1/$2?foo=bar",
    };

    const links = new PatternLinkTestProvider([rule]).provideLinks(document);
    assert.equal(links.length, 3);
    assert.equal(links[0].target, "https://example.com/FOO/123?foo=bar");
    assert.equal(links[2].target, "https://example.com/BAR/3?foo=bar");
  });

  test("Escape characters prevent substitution", async () => {
    const rule: Rule = {
      linkPattern: new UncompiledRegExp("(FOO|BAR)-(\\d+)"),
      linkTarget: "https://example.com/\\$1/$2?foo=bar",
    };

    const links = new PatternLinkTestProvider([rule]).provideLinks(document);
    assert.equal(links.length, 3);
    assert.equal(links[0].target, "https://example.com/$1/123?foo=bar");
    assert.equal(links[2].target, "https://example.com/$1/3?foo=bar");
  });

  test("Failed substitutions result in input remaining untouched (not 'undefined' in output)", async () => {
    const rule: Rule = {
      linkPattern: new UncompiledRegExp("(FOO|BAR)-(\\d+)"),
      linkTarget: "https://example.com/$1/$4",
    };

    const links = new PatternLinkTestProvider([rule]).provideLinks(document);
    assert.equal(links.length, 3);
    assert.equal(links[0].target, "https://example.com/FOO/$4");
  });

  suite("Config: `rule.linkPatternFlags`", () => {
    test("`g` flag does not matter", async () => {
      const rule: Rule = {
        linkPattern: new UncompiledRegExp("(FOO|BAR)-(\\d+)", new Set(["i"])),
        linkTarget: "https://example.com/$1/$4",
      };

      const links = new PatternLinkTestProvider([rule]).provideLinks(document);
      assert.equal(links.length, 4);
    });

    test("Single flags work", async () => {
      const rule: Rule = {
        linkPattern: new UncompiledRegExp("(BAR)-(\\d+)", new Set(["i"])),
        linkTarget: "https://example.com/$1/$2",
      };

      const links = new PatternLinkTestProvider([rule]).provideLinks(document);
      assert.equal(links.length, 2);
      assert.equal(links[0].target, "https://example.com/BAR/3");
      assert.equal(links[1].target, "https://example.com/bar/72");
    });

    test("Multiple flags work", async () => {
      const testWithFlag = (flags: string) => {
        const rule: Rule = {
          linkPattern: new UncompiledRegExp("start(.*?)end", new Set(flags)),
          linkTarget: "https://example.com/$1",
        };

        return new PatternLinkTestProvider([rule]).provideLinks(document);
      };

      // No flag
      assert.equal(testWithFlag("").length, 0);

      // Individual flags (not enough on their own)
      assert.equal(testWithFlag("i").length, 0);
      assert.equal(testWithFlag("s").length, 0);

      // Combined flags
      assert.equal(testWithFlag("is").length, 1);
      assert.equal(
        testWithFlag("is")[0].target,
        "https://example.com/some stuff\nnewline\nandmore"
      );
    });
  });
});
