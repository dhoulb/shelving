import type { MarkupOptions } from "./options.js";
import type { ImmutableArray } from "../util/array.js";
import type { JSXElement } from "../util/jsx.js";
import type { NamedRegExp, NamedRegExpData, TypedRegExp, TypedRegExpExecArray } from "../util/regexp.js";
import { formatURL, getOptionalURL } from "../util/url.js";

export type MarkupElement = {
	/** String index where this element was matched in the input string. */
	index: number;
	/** String length where this element was matched in the input string. */
	length: number;
	/** Context for this element's children in the input string, e.g. `"inline"` */
	context?: string;
} & JSXElement;

export interface MarkupRule {
	/**
	 * Contexts this rule should be applied in,
	 *
	 * @example `["block", "inline", "list"]`
	 */
	readonly contexts: ImmutableArray<string>;

	/**
	 * Priority for this rule (defaults to zero).
	 *
	 * @example e.g. `<p>` rule is lower priority than other blocks so it matches last and paragraphs can be interrupted by e.g. `<ul>` and `<blockquote>`.
	 * @example e.g. `<code>` rule is higher priority than other inlines so e.g. `<strong>` or `<em>` don't match inside a code block.
	 */
	readonly priority?: number | undefined;

	/** Match an input string against this and return an element if there was a match. */
	match(input: string, options: MarkupOptions): MarkupElement | undefined;
}

export function getRegExpMarkupRule<T extends string = string>(
	regexp: TypedRegExp<T>, //
	render: (props: TypedRegExpExecArray<T>, options: MarkupOptions) => JSXElement,
	contexts: ImmutableArray<string>,
	priority?: number,
): MarkupRule & { regexp: TypedRegExp<T> } {
	return {
		regexp,
		match(input: string, options): MarkupElement | undefined {
			const match = regexp.exec(input);
			if (match) {
				const {
					index,
					0: { length },
				} = match;
				return { index, length, ...render(match, options) };
			}
		},
		contexts,
		priority,
	};
}

export function getNamedRegExpMarkupRule<T extends NamedRegExpData>(
	regexp: NamedRegExp<T>, //
	render: (data: T, options: MarkupOptions) => JSXElement,
	contexts: ImmutableArray<string>,
	priority?: number,
): MarkupRule & { regexp: NamedRegExp<T> } {
	return {
		regexp,
		match(input: string, options): MarkupElement | undefined {
			const match = regexp.exec(input);
			if (match) {
				const {
					index,
					0: { length },
					groups,
				} = match;
				return { index, length, ...render(groups, options) };
			}
		},
		contexts,
		priority,
	};
}

export function getLinkRegExpMarkupRule(
	regexp: NamedRegExp<{ title?: string; href: string }>, //
	render: (title: string, href: string, options: MarkupOptions) => JSXElement,
	contexts: ImmutableArray<string>,
	priority?: number,
): MarkupRule & { regexp: NamedRegExp<{ title?: string; href: string }> } {
	return {
		regexp,
		match(input: string, options: MarkupOptions): MarkupElement | undefined {
			const match = this.regexp.exec(input);
			if (match) {
				const { schemes, url: base } = options;
				const {
					0: { length },
					index,
					groups: { href, title },
				} = match;
				const url = getOptionalURL(href, base);
				if (url && schemes.includes(url.protocol)) return { index, length, ...render(title?.trim() || formatURL(url), url.href, options) };
			}
		},
		contexts,
		priority,
	};
}

export type MarkupRules = MarkupRule[];
