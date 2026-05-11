import type { Element } from "../../util/element.js";
import type { NamedRegExp, NamedRegExpExecArray } from "../../util/regexp.js";
import type { MarkupOptions } from "./options.js";

export type MarkupContexts = [string, ...string[]];

export interface MarkupRule {
	/** Regular expression used for matching the rule. */
	regexp: RegExp;
	/** Use the matched data to render an element. */
	render(match: RegExpExecArray, options: MarkupOptions, key: string): Element;
	/** One or more contexts this rule should render in. */
	contexts: MarkupContexts;
	/** Priority for this rule (higher priority rules override lower priority rules). */
	priority: number;
}

export type MarkupRules = readonly MarkupRule[];

/** Helper to make it easier to create typed `MarkupRule` instances using `NamedRegExp` regular expressions. */
export function createMarkupRule<T extends NamedRegExp | RegExp>(
	regexp: T,
	render: T extends NamedRegExp<infer X>
		? (match: NamedRegExpExecArray<X>, options: MarkupOptions, key: string) => Element
		: (match: RegExpExecArray, options: MarkupOptions, key: string) => Element,
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
