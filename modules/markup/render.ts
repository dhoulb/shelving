import type { ReactElement, ReactNode } from "react";
import type { MarkupOptions } from "./util/options.js";
import type { MarkupRule } from "./util/rule.js";

/**
 * Parse a text string as Markdownish syntax and render it as elements.
 * - Syntax is not defined by this code, but by the rules supplied to it.
 *
 * @param input The string content possibly containing markup syntax, e.g. "This is a *bold* string.
 * @param options An options object for the render.
 * @param context The context to render in (defaults to `"block"`).
 *
 * @returns A React node — an element, a string, `null`, or an array of zero or more of those.
 */
export function renderMarkup(input: string, options: MarkupOptions, context = "block"): ReactNode {
	const arr = Array.from(_parseString(input, options, context));
	return !arr.length ? null : arr.length === 1 ? arr[0] : arr;
}

/**
 * Parse a string to its corresponding elements in a given context.
 * - This code is heavily inspired by `simple-markdown`, but intends to be even simpler (and faster) by always producing elements.
 */
function* _parseString(
	/** The input string. */
	input: string,
	/** Options that configure the render including the rules we're using. */
	options: MarkupOptions,
	/** The context for the render e.g. `"block"` */
	context: string,
	/** The offset of where we are in the _original_ string — this is used to compute the `key` property for the returned element. */
	offset = 0,
): Iterable<ReactElement | string> {
	// The best matched rule is the one with the highest priority.
	// If two have equal priority use the earliest match in the string.
	let bestMatch: RegExpExecArray | undefined;
	let bestRule: MarkupRule | undefined;

	// Loop through all rules in the list and see if any match.
	for (const rule of options.rules) {
		const { priority, regexp, contexts } = rule;

		// Skip rule if it has lower priority than the current best rule, or it doesn't apply in this context.
		if ((!bestRule || priority >= bestRule.priority) && contexts.includes(context)) {
			const match = regexp.exec(input);

			// This rule is the best rule if it matches, has higher priority than the current best rule, or is earlier in the string than the current best rule.
			if (match && (!bestRule || !bestMatch || priority > bestRule.priority || match.index < bestMatch.index)) {
				bestRule = rule;
				bestMatch = match;
			}
		}
	}

	// Was there a matching rule?
	if (bestRule && bestMatch) {
		const {
			index,
			0: { length },
		} = bestMatch;
		const end = bestMatch.index + length;

		// Parse the prefix and yield any elements.
		// Pass `offset` through so that `key` for any yielded elements stays anchored to the original string.
		if (bestMatch.index > 0) yield* _parseString(input.slice(0, bestMatch.index), options, context, offset);

		// Yield the matched element.
		yield bestRule.render(bestMatch, options, (offset + index).toString());

		// Parse the suffix and yield any elements.
		// Pass `offset + end` so that `key` for any yielded elements acknowledges its increased position in the original string.
		if (input.length > end) yield* _parseString(input.slice(end), options, context, offset + end);
	} else if (input.length) {
		// Nothing matched so return the entire string because this is a text node.
		yield input;
	}
}
