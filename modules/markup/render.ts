/* eslint-disable no-param-reassign */

import type { MarkupRule, MarkupOptions, MarkupNode } from "./types";
import { cleanMarkup } from "./helpers";
import { MARKUP_RULES, MARKUP_RULES_UGC } from "./rules";

/** Convert a string into an array of React nodes using a set of rules. */
const renderString = (content: string, options: MarkupOptions): MarkupNode => {
	// If there's no context return the unmodified string.
	if (!options.context) return content;

	const nodes: MarkupNode[] = [];

	// Loop until we've parsed the entire string.
	while (content.length) {
		// Loop through all rules in the list and see if any match.
		let matchedPriority = Number.MIN_SAFE_INTEGER;
		let matchedIndex = Number.MAX_SAFE_INTEGER;
		let matchedRule: MarkupRule | undefined = undefined;
		let matchedResult: RegExpMatchArray | undefined = undefined;
		for (const rule of options.rules) {
			const { priority = 0, match, contexts } = rule;
			// Only apply this rule if both:
			// 1. The priority is equal or higher to the current priority.
			// 2. The rule is allowed in the current context.
			if (priority >= matchedPriority && contexts.includes(options.context)) {
				const result = match(content, options);
				// If this matched and has an index (it might not if it's a `/g` global RegExp, which would be a mistake).
				if (result && typeof result.index === "number") {
					const index = result.index;
					// Only match the rule if either:
					// 1. The index is lower than the previous index then this rule takes priority.
					// 2. The priority is higher than the previous match then this rule takes priority.
					if (index < matchedIndex || priority > matchedPriority) {
						matchedRule = rule;
						matchedResult = result;
						matchedIndex = index;
						matchedPriority = priority;
					}
				}
			}
		}

		// Did at least one rule match?
		if (matchedRule && matchedResult && matchedResult[0]) {
			// If index is more than zero, then add a string node before this one.
			if (matchedIndex) {
				const prefix = content.substr(0, matchedIndex);
				appendNode(nodes, renderString(prefix, options));
			}

			// Call the rule's `render()` function to generate the node.
			const childOptions = { ...options, context: matchedRule.childContext };
			const element = matchedRule.render(matchedResult, childOptions);
			element.rule = matchedRule;
			appendNode(nodes, renderNode(element, childOptions));

			// Decrement the content.
			content = content.substr(matchedIndex + matchedResult[0].length);
		} else {
			// If nothing else matched add the rest of the string as a node (presumably it doesn't have any punctuation).
			// Don't need to push the string through `renderNode()` because we already know it doesn't match any rules in the current context.
			nodes.push(content);
			content = "";
		}
	}

	// If there's only one node return the single node (otherwise return the entire array).
	return !nodes.length ? null : nodes.length === 1 ? nodes[0] : nodes;
};

/**
 * Append a JSX node to a list of JSX nodes.
 * - Sets a generated `element.key` for JSX elements (based on `nodes.length`)
 * - JSX nodes can be arrays of nodes — these will be flattened directly into the nodes list.
 * - Nodes array is modified in place (not returned).
 */
const appendNode = (nodes: MarkupNode[], node: MarkupNode): void => {
	if (!node) {
		// No need to append null, undefined, or empty string.
		return;
	} else if (typeof node === "string") {
		// String nodes should be merged into the last node (if there are several in a row).
		const i = nodes.length - 1;
		if (typeof nodes[i] === "string") nodes[i] += node;
		else nodes.push(node);
	} else if (node instanceof Array) {
		// Nested arrays of nodes are flattened.
		for (const n of node) appendNode(nodes, n);
	} else {
		// Generate `key` property using a numeric incrementor (if it's a string let it pass — there's probably a reason it's a string).
		if (typeof node.key !== "string") node.key = nodes.length;
		// Append the node.
		nodes.push(node);
	}
};

/**
 * Render a JSX node
 * - Recursively renders the children of the node using the current options.
 */
const renderNode = (node: MarkupNode, options: MarkupOptions): MarkupNode => {
	if (typeof node === "string") return renderString(node, options);
	if (node instanceof Array) return node.map(n => renderNode(n, options));
	if (typeof node === "object" && node) {
		node.$$typeof = REACT_SECURITY_SYMBOL; // Inject React security type. See https://github.com/facebook/react/pull/4832
		if (node.props.children) node.props.children = renderNode(node.props.children, options);
		return node;
	}
	return node;
};
const REACT_SECURITY_SYMBOL = Symbol.for("react.element");

/**
 * Parse a text string as Markdownish syntax and render it as a JSX node.
 * - Syntax is not defined by this code, but by the rules supplied to it.
 * - Default rules define syntax similar to Markdown but with improvements:
 *   1. Syntax is more intuitive (e.g. `*strong*` always uses `*` asterisk and `_em_` always uses `_` underscore, and URLs are always autolinked).
 *   2. More compatible with textboxes that wrap lines by default (e.g. single `\n` linebreaks don't need the trailing double space to, they're always treated as `<br />`).
 *   3. Don't support fussy fragile syntax that lets users make mistakes (e.g. literal HTML tags or `&amp;` character entities).
 *
 * DH: This code is heavily inspired by `simple-markdown`, but intends to be even simpler by always producing JSX elements.
 *
 * @todo [ ] Default rules support "list items containing paragraphs" syntax (CommonMark calls this loose lists).
 *           - i.e. Lists can include `\n\n` double line breaks, and wrap all their contents in `<p>` entities, i.e. childContext is "block"
 *           - Hard because you have to capture the entire list including `\n\n`, so there's no obvious place to end it.
 *           - If there are breaks then any sub-lines need to be indented by two or more spaces otherwise it will break the list.
 *           - Make reference lists support this loose format too.
 * @todo [ ] Default rules support tables using `|` pipe syntax.
 * @todo [ ] Default rules support todo lists using `- [x]` syntax.
 * @todo [ ] Default rules support new reference syntax (combines reference lists/sidenotes/footnotes/reference and produces <dl> syntax).
 *           - All of these can be the same because reference links and Extended Markdown footnotes are basically the same.
 *           - e.g. `[Google Maps][1]` → `[1]: http://google.com Content goes here` (Markdown reference link syntax).
 *           - e.g. `[Google Maps]` → `[Google Maps]: http://google.com Content goes here` syntax.
 *           - e.g. `[DNS]` → `[DNS]: Domain Name System (extended Markdown definition list format).
 *           - If a `[Reference]` does not correspond to anything it will not be linked and e.g. will appear unlinked.
 *           - Single/double quotes around definition part are optional and are trimmed from the start/end (Extended Markdown definition lists require quotes, but that's dumb).
 *           - A `<dl>` definition list is used as the output format for all of these different use cases.
 *           - If the first thing in the definition is a URL, then it's recognised as a link reference (and produces an `<a href=""></a>`)
 *           - If the first thing in the definition isn't a URL, then it's recognised as a sidenote/footnote and tapping it will scroll you to that point (and popup the definition like Marco Arment's Bigfoot code).
 *
 * @param content The string content possibly containing markup syntax, e.g. "This is a *bold* string.
 * @param options An options object for the render.
 *
 * @returns ReactNode, i.e. either a complete `ReactElement`, `null`, `undefined`, `string`, or an array of zero or more of those.
 */
export const renderMarkup = (content: string, options?: Partial<MarkupOptions>): MarkupNode =>
	renderString(
		cleanMarkup(content),
		{ ...defaults, ...options, rules: Array.from(options?.rules || defaults.rules) }, // Convert rules to an array — slightly more efficient when we might call the iterator thousands of times.
	);
const defaults: MarkupOptions = {
	rules: MARKUP_RULES,
	context: "block",
	url: undefined,
	rel: undefined,
	schemes: ["http:", "https:"],
};

/**
 * Parse a text string as user-generated markup.
 * - Like `renderMarkup()` but only enables a subset of rules and applies `rel="nofollow ugc"` to all links.
 */
export const renderUgcMarkup = (content: string, options?: Partial<MarkupOptions>): MarkupNode =>
	renderString(
		cleanMarkup(content),
		{ ...defaultsUgc, ...options, rules: Array.from(options?.rules || defaultsUgc.rules) }, // Convert rules to an array — slightly more efficient when we might call the iterator thousands of times.
	);
const defaultsUgc: MarkupOptions = {
	...defaults,
	rules: MARKUP_RULES_UGC,
	rel: "nofollow ugc",
};
