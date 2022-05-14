import * as vscode from "vscode";
import { PartialDeep } from "type-fest";

import * as rule from "./rule";

export const EXTENSION_NAME = "patternlinks";

interface Config {
  rules: {
    linkPattern: string;
    linkPatternFlags: string;
    linkTarget: string;
    languages: string[];
    terminal: boolean;
  }[];
}

export function getRules(): rule.Rule[] {
  const config: PartialDeep<Config> =
    vscode.workspace.getConfiguration().get(EXTENSION_NAME) ?? {};

  return (config.rules ?? []).flatMap((configRule) => {
    let {
      linkPattern,
      linkTarget,
      linkPatternFlags = "",
      languages = [],
      terminal = "true",
    } = configRule ?? {};

    // If required values are missing, filter this entire
    // rule out.
    if (!linkPattern || !linkTarget) {
      return [];
    }

    // Remove null/undefined
    let finalLanguages = languages.flatMap((language) => {
      return !language ? [] : language;
    });

    // No language defined means all languages.
    if (finalLanguages.length === 0) {
      finalLanguages.push("*");
    }

    let patternFlags = new Set(linkPatternFlags.split(""));

    return {
      linkPattern: new rule.UncompiledRegExp(linkPattern, patternFlags),
      linkTarget,
      languages: finalLanguages,
      terminal: terminal == "true",
    };
  });
}
