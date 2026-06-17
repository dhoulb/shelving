import type { ReactElement } from "react";
import type { EmptyDictionary } from "../util/dictionary.js";
import type { NamedRegExp, NamedRegExpData } from "../util/regexp.js";
import type { MarkupParser } from "./MarkupParser.js";

/**
 * One or more named contexts a markup rule renders in (e.g. `["block"]`, `["inline", "list", "link"]`).
 *
 * @see https://dhoulb.github.io/shelving/markup/MarkupRule/MarkupContexts
 */
export type MarkupContexts = [string, ...string[]];

/**
 * A single markup rule: a regular expression that matches a span of input plus a renderer that turns the match into an element.
 * - Rules are grouped into priority tiers and resolved highest tier first by [`MarkupParser`](/markup/MarkupParser).
 * - A rule renders only in the contexts it lists, letting the same syntax behave differently in block vs inline vs list context.
 *
 * @see https://dhoulb.github.io/shelving/markup/MarkupRule/MarkupRule
 */
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

/**
 * An immutable list of [`MarkupRule`](/markup/MarkupRule) instances applied by a [`MarkupParser`](/markup/MarkupParser).
 *
 * @see https://dhoulb.github.io/shelving/markup/MarkupRule/MarkupRules
 */
export type MarkupRules = readonly MarkupRule[];

/**
 * Create a typed [`MarkupRule`](/markup/MarkupRule) from a [`NamedRegExp`](/util/regexp/NamedRegExp), a renderer, its contexts, and an optional priority.
 *
 * *Factory for `MarkupRule`.*
 *
 * - The overload taking a `NamedRegExp<T>` infers the named capture groups handed to `render`.
 * - Higher `priority` rules are resolved (and masked) before lower-priority ones.
 *
 * @param regexp Regular expression used to match the rule (a `NamedRegExp` to type the render data).
 * @param render Renderer turning a `key`, the matched `data`, and the active `parser` into a `ReactElement`.
 * @param contexts One or more contexts this rule renders in (e.g. `["block"]`).
 * @param priority Tier priority — higher rules override lower ones (defaults to `0`).
 * @returns A `MarkupRule` ready to add to a [`MarkupRules`](/markup/MarkupRules) list.
 * @example
 * const HR_RULE = createMarkupRule(/^---$/m, key => <hr key={key} />, ["block"]);
 * @see https://dhoulb.github.io/shelving/markup/MarkupRule/createMarkupRule
 */
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
