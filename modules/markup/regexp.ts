import type { NamedRegExp, NamedRegExpData, PossibleRegExp } from "../util/regexp.js";
import { getRegExpSource } from "../util/regexp.js";

export const BLOCK_REGEXP = /[\s\S]*?/; // Block of content (shortest possible run of any character including newlines).
export const BLOCK_START_REGEXP = /^\n*|\n+/; // Start of block (one or more linebreaks, or start of string).
export const BLOCK_END_REGEXP = /\n*$|\n\n+/; // End of block (two or more linebreaks, or end of string).

/** Create regular expression that matches a block of content. */
export function getBlockRegExp<T extends NamedRegExpData>(content: NamedRegExp<T>): NamedRegExp<T>; // Named regexp will pass the same named groups through.
export function getBlockRegExp<T extends string>(content: `(?<${T}>${string})`): NamedRegExp<{ [K in T]: string }>; // One named group is easy to detect.
export function getBlockRegExp(content?: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp): RegExp; // Anything else falls back to `RegExp` and named groups must be asserted.
export function getBlockRegExp(
	content: PossibleRegExp = BLOCK_REGEXP,
	end: PossibleRegExp = BLOCK_END_REGEXP,
	start: PossibleRegExp = BLOCK_START_REGEXP,
): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(content)})(?:${getRegExpSource(end)})`);
}

export const LINE_REGEXP = /[^\n]*/; // Line of content (anything that's not a newline).
export const LINE_START_REGEXP = /^\n*|\n+/; // Start of line (one or more linebreaks, or start of string).
export const LINE_END_REGEXP = /\n+|$/; // End of line (one or more linebreaks, or end of string).

/** Create regular expression that matches a line of content. */
export function getLineRegExp<T extends NamedRegExpData>(content: NamedRegExp<T>): NamedRegExp<T>; // Named regexp will pass the same named groups through.
export function getLineRegExp<T extends string>(content: `(?<${T}>${string})`): NamedRegExp<{ [K in T]: string }>; // One named group is easy to detect.
export function getLineRegExp(content?: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp): RegExp; // Anything else falls back to `RegExp` and named groups must be asserted.
export function getLineRegExp(
	content: PossibleRegExp = LINE_REGEXP,
	end: PossibleRegExp = LINE_END_REGEXP,
	start: PossibleRegExp = LINE_START_REGEXP,
): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(content)})(?:${getRegExpSource(end)})`);
}

export const WORD_REGEXP = /[\\p{L}\\p{N}]+/; // Match line of content (anything that's not a newline).
export const WORD_START_REGEXP = /(?<![\\p{L}\\p{N}])/; // Start of word (previous character is not a letter or number).
export const WORD_END_REGEXP = /(?![\\p{L}\\p{N}])/; // End of word (next character is not a letter or number).

/** Create regular expression that matches a line of content. */
export function getWordRegExp<T extends NamedRegExpData>(content: NamedRegExp<T>): NamedRegExp<T>; // Named regexp will pass the same named groups through.
export function getWordRegExp<T extends string>(content: `(?<${T}>${string})`): NamedRegExp<{ [K in T]: string }>; // One named group is easy to detect.
export function getWordRegExp(content?: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp): RegExp; // Anything else falls back to `RegExp` and named groups must be asserted.
export function getWordRegExp(
	content: PossibleRegExp = WORD_REGEXP,
	end: PossibleRegExp = WORD_END_REGEXP,
	start: PossibleRegExp = WORD_START_REGEXP,
): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(content)})(?:${getRegExpSource(end)})`);
}
