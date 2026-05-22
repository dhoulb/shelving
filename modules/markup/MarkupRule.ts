import type { ReactElement } from "react";
import type { EmptyDictionary } from "../util/dictionary.js";
import type { NamedRegExp, NamedRegExpData } from "../util/regexp.js";
import type { MarkupParser } from "./MarkupParser.js";

export type MarkupContexts = [string, ...string[]];

export interface MarkupRule {
	/** Regular expression used for matching the rule. */
	regexp: RegExp;
	/** Use the matched data to render an element. */
	render(key: string, data: NamedRegExpData | undefined, parser: MarkupParser): ReactElement;
	/** One or more contexts this rule should render in. */
	contexts: MarkupContexts;
	/** Priority for this rule (higher priority rules override lower priority rules). */
	priority: number;
}

export type MarkupRules = readonly MarkupRule[];

/** Helper to make it easier to create typed `MarkupRule` instances using `NamedRegExp` regular expressions. */
export function createMarkupRule<T extends NamedRegExpData>(
	regexp: NamedRegExp<T>,
	render: (key: string, data: T, parser: MarkupParser) => ReactElement,
	contexts: MarkupContexts,
	priority?: number,
): MarkupRule;
export function createMarkupRule(
	regexp: RegExp,
	render: (key: string, data: EmptyDictionary, parser: MarkupParser) => ReactElement,
	contexts: MarkupContexts,
	priority?: number,
): MarkupRule;
export function createMarkupRule<T extends NamedRegExpData>(
	regexp: NamedRegExp<T> | RegExp,
	render: (key: string, data: T, parser: MarkupParser) => ReactElement,
	contexts: MarkupContexts,
	priority = 0,
): MarkupRule {
	return {
		regexp,
		render,
		contexts,
		priority,
	};
}
