import type { MarkupOptions } from "./options.js";
import type { ImmutableArray } from "../util/array.js";
import type { JSXElement } from "../util/jsx.js";
import type { NamedRegExp, NamedRegExpData, TypedRegExp, TypedRegExpExecArray } from "../util/regexp.js";
import { getOptionalLink } from "../util/link.js";
import { formatURL } from "../util/url.js";

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

export class RegExpMarkupRule<T extends string = string> implements MarkupRule {
	constructor(
		readonly regexp: TypedRegExp<T>, //
		readonly render: (props: TypedRegExpExecArray<T>, options: MarkupOptions) => JSXElement,
		readonly contexts: ImmutableArray<string>,
		readonly priority?: number,
	) {
		//
	}
	match(input: string, options: MarkupOptions): MarkupElement | undefined {
		const match = this.regexp.exec(input);
		if (match) {
			const {
				index,
				0: { length },
			} = match;
			return { index, length, ...this.render(match, options) };
		}
	}
}

export class NamedRegExpMarkupRule<T extends NamedRegExpData> implements MarkupRule {
	constructor(
		readonly regexp: NamedRegExp<T>, //
		readonly render: (data: T, options: MarkupOptions) => JSXElement,
		readonly contexts: ImmutableArray<string>,
		readonly priority?: number,
	) {
		//
	}
	match(input: string, options: MarkupOptions): MarkupElement | undefined {
		const match = this.regexp.exec(input);
		if (match) {
			const {
				index,
				0: { length },
				groups,
			} = match;
			return { index, length, ...this.render(groups, options) };
		}
	}
}

export class LinkRegExpMarkupRule implements MarkupRule {
	constructor(
		readonly regexp: NamedRegExp<{ title?: string; href: string }>, //
		readonly render: (title: string, href: string, options: MarkupOptions) => JSXElement,
		readonly contexts: ImmutableArray<string>,
		readonly priority?: number,
	) {
		//
	}
	match(input: string, options: MarkupOptions): MarkupElement | undefined {
		const match = this.regexp.exec(input);
		if (match) {
			const { schemes, base, hosts } = options;
			const {
				0: { length },
				index,
				groups: { href, title },
			} = match;
			const link = getOptionalLink(href, base, schemes, hosts);
			if (link) return { index, length, ...this.render(title?.trim() || formatURL(link), link, options) };
		}
	}
}

export type MarkupRules = MarkupRule[];
