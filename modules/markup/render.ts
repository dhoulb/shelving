/* eslint-disable no-param-reassign */

import type { MarkupOptions } from "./options.js";
import type { MarkupRule, MarkupRuleMatch } from "./rule.js";
import type { Data } from "../util/data.js";
import type { JSXElement, JSXNode } from "../util/jsx.js";
import { isArray } from "../util/array.js";
import { MARKUP_OPTIONS } from "./options.js";

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
 * @param input The string content possibly containing markup syntax, e.g. "This is a *bold* string.
 * @param options An options object for the render.
 *
 * @returns JSXNode, i.e. either a complete `JSXElement`, `null`, `undefined`, `string`, or an array of zero or more of those.
 */
export function renderMarkup(input: string, options?: Partial<MarkupOptions>): JSXNode {
	if (!input) return null;
	const combined = options ? { ...MARKUP_OPTIONS, ...options } : MARKUP_OPTIONS;
	return _renderString(input, combined, combined.context);
}

/**
 * Render a string to its corresponding JSX node in a given context.
 */
function _renderString(input: string, options: MarkupOptions, context: string): JSXNode {
	const nodes = Array.from(_parseString(input, options, context));
	return !nodes.length ? null : nodes.length === 1 ? nodes[0] : nodes;
}

/**
 * Render a JSX node in a given context.
 */
function _renderNode(node: JSXNode, options: MarkupOptions, context: string): JSXNode {
	if (!node) return node;
	if (typeof node === "string") return _renderString(node, options, context);
	if (isArray(node)) {
		for (let i = 0; i <= node.length - 1; i++) node[i] = _renderNode(node[i], options, context);
		return node;
	}
	return _renderElement(node, options, context);
}

/**
 * Render a JSX element in a given context.
 */
function _renderElement(element: JSXElement, options: MarkupOptions, context: string): JSXElement {
	if (element.props.children) element.props.children = _renderNode(element.props.children, options, context);
	return element;
}

/**
 * Parse a string to its corresponding JSX nodes in a given context.
 *
 * @param offset Keeps track of where we are within the wider string we're parsing when we're several calls deep.
 */
function* _parseString(input: string, options: MarkupOptions, context: string, offset = 0): Iterable<JSXElement | string> {
	let matchedRule: MarkupRule | undefined = undefined;
	let matchedResult: MarkupRuleMatch<Data> | undefined = undefined;
	let highPriority = Number.MIN_SAFE_INTEGER;
	let lowIndex = Number.MIN_SAFE_INTEGER;

	// Loop through all rules in the list and see if any match.
	for (const rule of options.rules) {
		// Only apply this rule if both:
		// 1. The priority is equal or higher to the current priority.
		// 2. The rule is allowed in the current context.
		const { priority } = rule;
		if (rule.priority >= highPriority && rule.contexts.includes(context)) {
			const result = rule.match(input, options);
			if (result) {
				// Use the match if it has length and is earlier in the string or is higher priority.
				const { 0: { length } = "", index } = result;
				if (length && (index < lowIndex || rule.priority > highPriority)) {
					matchedRule = rule;
					matchedResult = result;
					highPriority = priority;
					lowIndex = index;
				}
			}
		}
	}

	// Did at least one rule match?
	if (matchedRule && matchedResult) {
		// If index is more than zero, then the string before the match may match another rule at lower priority.
		const prefix = input.slice(0, lowIndex);
		if (prefix.length) yield* _parseString(prefix, options, context, offset);

		// Call the rule's `render()` function to generate the node.
		// React gets annoyed if we don't set a `key:` property on lists of elements.
		// We use the string offset as the `.key` property in the element because it's cheap to calculate and guaranteed to be unique within the string.
		// Trying to generate an incrementing number would require tracking the number and passing it back and forth through `_parseString()`
		const { 0: { length } = "", groups, index } = matchedResult;
		const element = matchedRule.render(groups, options);
		element.key = offset + index;
		const { subcontext } = matchedRule;
		yield subcontext ? _renderElement(element, options, subcontext) : element;

		// Decrement the content.
		const suffix = input.slice(index + length);
		if (suffix.length) yield* _parseString(suffix, options, context, offset + index + length);
	} else {
		// If nothing matched return the entire string..
		yield input;
	}
}
