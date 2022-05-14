export interface Rule {
  linkPattern: UncompiledRegExp;
  linkTarget: string;
  languages?: string[];
  terminal?: boolean;
}

/*
  vscode.TerminalLinkProvider wants us to be very careful about being stateful,
  so we use this class to represent a regular expression we haven't yet turned
  into a RegExp object (RegExp objects contain state about their last match).
*/
export class UncompiledRegExp {
  private regexp: string;
  private flags: Set<string>;

  constructor(regexp: string, flags?: Set<string>) {
    this.regexp = regexp;
    this.flags = flags ?? new Set();
  }

  public compile(flags?: Set<string>): RegExp {
    let allFlags = this.flags;
    if (flags) flags.forEach((f) => allFlags.add(f));
    return new RegExp(this.regexp, Array.from(allFlags).join(""));
  }

  public static unionOf(ures: UncompiledRegExp[]): UncompiledRegExp {
    let allFlags: Set<string> = new Set();
    ures.forEach((ure) => ure.flags.forEach((f) => allFlags.add(f)));
    // Each regexp becomes a non-capturing group, so we know we've dealt with
    // the precedence of `|` correctly.
    let unionMatcher = ures.map((ure) => `(?:${ure.regexp})`).join("|");

    return new UncompiledRegExp(unionMatcher, allFlags);
  }
}

// This is a RegExpMatchArray with a concrete index.
export interface PatternMatchArray extends RegExpMatchArray {
  index: number;
}

/*
  This class encodes the logic of looking for multiple regexps in the same
  string.
*/
export class MultiRuleMatcher {
  private eachRule: Rule[];
  private unionRegExp: UncompiledRegExp;

  constructor(rules: Rule[]) {
    this.eachRule = rules;
    this.unionRegExp = UncompiledRegExp.unionOf(
      rules.map((r) => r.linkPattern)
    );
  }

  /*
    Use this method to find any matching `Rule` in `text`. The callback will be
    called for each match with the rule that matched, the result of the match
    (for that exact rule's pattern, rather than the union).
  */
  protected forEachMatch(
    text: string,
    callbackfn: (rule: Rule, match: PatternMatchArray) => void
  ): void {
    // We compile the union regexp with `g` so it matches multiple times. This
    // means individual regexps do not need `g`.
    let unionRegExp = this.unionRegExp.compile(new Set("g"));
    let compiledRules = this.eachRule
      .map((r) => {
        return {
          rule: r,
          regExp: r.linkPattern.compile(),
        };
      })
      .reverse(); /* so that later rules are checked before earlier rules. */

    for (const match of text.matchAll(unionRegExp)) {
      if (match.index == null) continue;
      const index: number = match.index;
      const matchText = match[0];

      for (const compiledRule of compiledRules) {
        let oneRuleMatch = matchText.match(compiledRule.regExp);
        if (!oneRuleMatch) continue;
        // Check if this rule completely produced matchText:
        if (oneRuleMatch[0] != matchText) continue;

        // Hack: we modify the current match to ensure the `index` inside is
        // relative to `text` not `matchText`.
        oneRuleMatch.index = index;
        let patternMatch = oneRuleMatch as PatternMatchArray;

        callbackfn(compiledRule.rule, patternMatch);
        break;
      }
    }
  }

  protected static interpolateRule(
    rule: Rule,
    match: RegExpMatchArray
  ): string {
    return rule.linkTarget
      .replace(/(^|[^\\])\$(\d)/g, (_, nonEscapeChar, targetMatchIndex) => {
        return (
          nonEscapeChar +
          ((match as RegExpMatchArray)[Number(targetMatchIndex)] ??
            `$${targetMatchIndex}`)
        );
      })
      .replace(/\\\$/g, "$");
  }
}
