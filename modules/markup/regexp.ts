import type { Data } from "../util/data.js";
import { getRegExpSource, NamedRegExp, PossibleRegExp } from "../util/regexp.js";
import type { MarkupOptions } from "./options.js";

/** Subset of `NamedRegExpArray<T>` that are the only things we're required return from a `MarkupMatcher` function. */
export type MarkupMatch<T extends Data | undefined = Data | undefined> = { 0: string; index: number; groups: T };

/** Function that matches a string and returns a `MarkupMatch` or `null` or `void` */
export type MarkupMatcher<T extends Data | undefined = Data | undefined> = (input: string, options: MarkupOptions) => MarkupMatch<T> | null | void;

// Regular expressions.
export const LINE_REGEXP = /[^\n]*/; // Match line of content (anything that's not a newline).
export const LINE_START_REGEXP = /^\n*|\n+/; // Starts at start of line (one or more linebreak or start of string).
export const LINE_END_REGEXP = /\n+|$/; // Ends at end of line (one or more linebreak or end of string).
export const BLOCK_REGEXP = /[\s\S]*?/; // Match block of content (including newlines so don't be greedy).
export const BLOCK_START_REGEXP = /^\n*|\n+/; // Starts at start of a block (one or more linebreak or start of string).
export const BLOCK_END_REGEXP = /\n*$|\n\n+/; // End of a block (two or more linebreaks or end of string).
export const WORDS_REGEXP = /\S(?:[\s\S]*?\S)?/; // Set of words (one or more characters not starting or ending with whitespace).

/** Create regular expression that matches a block of content (possibly asserting that it contains named match groups). */
export function getBlockRegExp(content: PossibleRegExp = BLOCK_REGEXP, end: PossibleRegExp = BLOCK_END_REGEXP, start: PossibleRegExp = BLOCK_START_REGEXP): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(content)})(?:${getRegExpSource(end)})`);
}

/** Create regular expression that matches a line of content (possibly asserting that it contains named match groups). */
export function getLineRegExp(content: PossibleRegExp = LINE_REGEXP, end: PossibleRegExp = LINE_END_REGEXP, start: PossibleRegExp = LINE_START_REGEXP): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(content)})(?:${getRegExpSource(end)})`);
}

/**
 * Create matcher function that matches a piece of text wrapped by another expression (use `text` match group).
 */
export function getWrappedRegExp(wrap: PossibleRegExp, content: PossibleRegExp = WORDS_REGEXP): NamedRegExp<{ wrap: string; text: string }> {
	return new WordRegExp(`(?<wrap>${getRegExpSource(wrap)})(?<text>${getRegExpSource(content)})\\k<wrap>`) as NamedRegExp<{ wrap: string; text: string }>;
}

/**
 * Regular expression that only matches complete its pattern if it's a complete word.
 * - Won't match if there are letters or numbers directly before/after the matched content.
 * - Will match if there is punctuation before/after the matched content or it is at the start/end of the string.
 * - e.g. `this` and `"this"` and `that this that` and `that (this) that` will match because `this` is a complete word.
 * - e.g. `thatthis` and `thatthisthat` will not because `this` is only part of a complete word.
 *
 * @note This isn't guaranteed to work with `String.prototype.match()` and `String.prototype.replace()`
 *
 * @todo This can be much less complicated when Safari supports lookbehinds in regular expressions.
 * - We use a negative lookahead for the end of the word and it works great.
 * - If we could use a negative lookbehind for the start of the word we wouldn't need to create a function that offsets the start.
 */
export class WordRegExp extends RegExp {
	constructor(pattern: string) {
		super(`(?<lookbehind>^|[^\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`);
	}
	override exec(input: string): RegExpExecArray | null {
		const match = super.exec(input);
		if (match) {
			const { 0: zero, groups } = match;
			const offset = groups?.lookbehind?.length || 0;
			if (zero && offset) {
				match[0] = zero.slice(offset); // Slice off the start of the match to remove the matched first character.
				match.index += offset; // Increment the index to remove the matched first character.
			}
		}
		return match;
	}
	override test(input: string): boolean {
		return !!this.exec(input);
	}
}
