import { NamedRegExp, NamedRegExpArray, NamedRegExpData } from "../util/regexp.js";
import { Data } from "../util/data.js";
import { JSXElement } from "../util/jsx.js";
import { ImmutableArray } from "../util/array.js";
import { formatURL, getOptionalURL } from "../util/url.js";
import { MarkupOptions } from "./options.js";

export type MarkupRuleMatch<T extends Data = Data> = { 0: string; index: number; groups?: T };

export abstract class MarkupRule {
	/**
	 * Contexts this rule should be applied in,
	 *
	 * @example `["block", "inline", "list"]`
	 */
	readonly contexts: ImmutableArray<string>;

	/**
	 * Context that children should be rendered with.
	 *
	 * @example `"inline"` // Children of the element rendered by this rule will be parsed against markup rules applied in the "inline" context.
	 */
	readonly subcontext: string | null;

	/**
	 * Priority for this rule (defaults to zero).
	 *
	 * @example e.g. `<p>` rule is lower priority than other blocks so it matches last and paragraphs can be interrupted by e.g. `<ul>` and `<blockquote>`.
	 * @example e.g. `<code>` rule is higher priority than other inlines so e.g. `<strong>` or `<em>` don't match inside a code block.
	 */
	readonly priority: number;

	constructor(
		contexts: ImmutableArray<string>, //
		subcontext: string | null = null,
		priority = 0,
	) {
		this.contexts = contexts;
		this.subcontext = subcontext;
		this.priority = priority;
	}

	/** Match an input string against this  */
	abstract match(input: string, options: MarkupOptions): MarkupRuleMatch | null;

	/** Render the JSX element for this rule using the props matched by `.match` */
	abstract render(props: Data | undefined, options: MarkupOptions): JSXElement;
}

export class RegExpMarkupRule extends MarkupRule {
	constructor(
		private readonly _regexp: RegExp, //
		private readonly _render: (props: Data, options: MarkupOptions) => JSXElement,
		contexts: ImmutableArray<string>,
		subcontext?: string | null,
		priority?: number,
	) {
		super(contexts, subcontext, priority);
	}
	match(input: string): MarkupRuleMatch | null {
		return this._regexp.exec(input);
	}
	render(props: Data, options: MarkupOptions): JSXElement {
		return this._render(props, options);
	}
}

export class NamedRegExpMarkupRule<T extends NamedRegExpData> extends MarkupRule {
	constructor(
		private readonly _regexp: NamedRegExp<T>, //
		private readonly _render: (props: T, options: MarkupOptions) => JSXElement,
		contexts: ImmutableArray<string>,
		subcontext?: string | null,
		priority?: number,
	) {
		super(contexts, subcontext, priority);
	}
	match(input: string): NamedRegExpArray<T> | null {
		return this._regexp.exec(input);
	}
	render(props: T, options: MarkupOptions): JSXElement {
		return this._render(props, options);
	}
}

export class LinkRegExpMarkupRule extends MarkupRule {
	constructor(
		readonly _regexp: NamedRegExp<{ title?: string; href: string }>, //
		readonly _render: (props: { title: string; href: string }, options: MarkupOptions) => JSXElement,
		contexts: ImmutableArray<string>,
		subcontext?: string | null,
		priority?: number,
	) {
		super(contexts, subcontext, priority);
	}
	// Validates that the link is a valid URL (using `getOptionalURL()` to resolve relative links relative to `options.url`).
	// Validates that the link's URL scheme is in the `options.schemes` whitelist (defaults to `http` and `https`).
	// Generates a default title for the link using `formatURL()` (e.g. `shax.com/my/dir`).
	match(input: string, { schemes, url: base }: MarkupOptions): MarkupRuleMatch<{ title: string; href: string }> | null {
		const match = this._regexp.exec(input);
		if (match) {
			const { 0: first, index, groups } = match;
			const { href, title } = groups;
			const url = getOptionalURL(href, base);
			if (url && schemes.includes(url.protocol)) {
				return { 0: first, index, groups: { href: url.href, title: title?.trim() || formatURL(url) } };
			}
		}
		return null;
	}
	render(props: { title: string; href: string }, options: MarkupOptions) {
		return this._render(props, options);
	}
}

export type MarkupRules = MarkupRule[];
