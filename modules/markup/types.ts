import type { ImmutableObject } from "../object";

/**
 * JSX element.
 * - Compatible with but _slightly_ more flexible than `React.ReactElement`
 */
export type MarkupElement = {
	type: string;
	key: string | number | null;
	props: MarkupElementProps;
};
export type MarkupElementProps = {
	[prop: string]: unknown;
	children?: MarkupNode;
};

/** JSX node (compatible with but slightly more flexible than `React.ReactNode`) */
export type MarkupNode = undefined | null | string | MarkupElement | MarkupNode[];

/** A single markup parsing rule. */
export type MarkupRule = {
	/** RegExp that matches this rule. */
	readonly match: MarkupRuleMatcher;
	/**
	 * Return a corresponding JSX element for the match.
	 * @param ...matches The matches from `match` RegExp (without the `0` zeroeth "whole match").
	 * @returns Valid JSX node.
	 *   - The `key` property is not required (will be set automatically).
	 *   - e.g. `{ type: "a", props: { href: "/example.html", className: "strong", children: "Children *can* include _syntax_" } }`
	 */
	readonly render: MarkupRuleRenderer;
	/** Apply the rule only when in certain contexts, e.g. `["block", "inline", "list"]` */
	readonly contexts: string[];
	/** Context any string children returned from `render()` should be rendered with. */
	readonly childContext?: string;
	/**
	 * Priority for this rule (defaults to zero).
	 * - Used to apply precedence ordering to different rules.
	 * - Higher priority rules will match first even if they match further from the start of the string.
	 *
	 * @example e.g. `paragraph` rule is lower priority than other blocks so it matches last and paragraphs can be broken by other blocks.
	 * @example e.g. `code` inline blocks are higher priority than other blocks so they match first before e.g. `strong` or `em`
	 */
	readonly priority?: number;
};
export type MarkupRuleMatcher = (content: string, options: MarkupOptions) => RegExpMatchArray | null | undefined | void;
export type MarkupRuleRenderer = (matches: RegExpMatchArray, options: MarkupOptions) => MarkupElement;

/** A set of parse rules. */
export type MarkupRules = MarkupRule[];

/** The current parsing options (represents the current state of the parsing). */
export type MarkupOptions = {
	/** The current parsing context, e.g. "block" or "inline" */
	readonly context: string | undefined;
	/** The current list of parsing rules. */
	readonly rules: readonly MarkupRule[] | ImmutableObject<MarkupRule>;
	/** Set the `$$typeof` property for any created JSX elements (used for React security, see https://github.com/facebook/react/pull/4832) */
	/**
	 * Set a function that post-processes any created elements
	 * - React inserts a `$$typeof` security symbol into create elements (see https://github.com/facebook/react/pull/4832)
	 * - If you don't include the `$$typeof` key then React will refuse to render the element.
	 * - Set this option `React.createElement()` and that will happen automatically.
	 */
	readonly createElement?: MarkupElementCreator;
	/** Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`). */
	readonly rel: string | undefined;
	/** Valid URL schemes/protocols for links (including trailing commas), defaults to `[`http:`, `https:`]` */
	readonly schemes: string[];
};

/** The create element function. */
export type MarkupElementCreator = (type: string, props?: MarkupElementProps | null) => MarkupElement;
