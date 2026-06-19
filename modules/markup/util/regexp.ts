import type { NamedRegExp, NamedRegExpData, PossibleRegExp } from "../../util/regexp.js";
import { getRegExpSource } from "../../util/regexp.js";

/**
 * Regular expression source matching block content — the shortest run of any character.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/BLOCK_CONTENT_REGEXP
 */
export const BLOCK_CONTENT_REGEXP = "[\\s\\S]*?"; // Block content (shortest run of any character).

/**
 * Regular expression source matching block whitespace — any single whitespace character.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/BLOCK_SPACE_REGEXP
 */
export const BLOCK_SPACE_REGEXP = "\\s"; // Block whitespace (run of any whitespace character).

/**
 * Regular expression source matching the start of a block — the start of the string, or one linebreak.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/BLOCK_START_REGEXP
 */
export const BLOCK_START_REGEXP = "(?:\\s*\\n|^)"; // Start of block (start of string, or one linebreak).

/**
 * Regular expression source matching the end of a block — the end of the string, or two linebreaks, with trailing whitespace trimmed.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/BLOCK_END_REGEXP
 */
export const BLOCK_END_REGEXP = "\\s*(?:$|\\n\\s*\\n)"; // End of block (end of string, or two linebreaks, trimmed whitespace).

/**
 * Regular expression source matching line content — the shortest run of any character except newline.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/LINE_CONTENT_REGEXP
 */
export const LINE_CONTENT_REGEXP = "[^\\n]*?"; // Line content (shortest run of any character except newline).

/**
 * Regular expression source matching line whitespace — any single whitespace character except newline.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/LINE_SPACE_REGEXP
 */
export const LINE_SPACE_REGEXP = "[^\\n\\S]"; // Line whitespace (run of any whitespace character except newline).

/**
 * Regular expression source matching the start of a line — the start of the string, or one linebreak.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/LINE_START_REGEXP
 */
export const LINE_START_REGEXP = BLOCK_START_REGEXP; // Start of line (start of string, or one linebreak).

/**
 * Regular expression source matching the end of a line — the end of the string, or one linebreak, with trailing whitespace trimmed.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/LINE_END_REGEXP
 */
export const LINE_END_REGEXP = `${LINE_SPACE_REGEXP}*(?:\\s*\\n|$)`; // End of line (end of string, or one linebreak, trimmed whitespace).

/**
 * Regular expression source matching word content — at least one letter or number character.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/WORD_CONTENT_REGEXP
 */
export const WORD_CONTENT_REGEXP = "[\\p{L}\\p{N}]+"; // Word content (at least one character that is a letter or number).

/**
 * Regular expression source matching the start of a word — a zero-width assertion that the previous character is not a letter or number.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/WORD_START_REGEXP
 */
export const WORD_START_REGEXP = "(?<![\\p{L}\\p{N}])"; // Start of word (previous character is not a letter or number).

/**
 * Regular expression source matching the end of a word — a zero-width assertion that the next character is not a letter or number.
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/WORD_END_REGEXP
 */
export const WORD_END_REGEXP = "(?![\\p{L}\\p{N}])"; // End of word (next character is not a letter or number).

/**
 * Create a `RegExp` that matches a block of content, wrapped between block-start and block-end boundaries.
 *
 * *Factory for `RegExp`.*
 *
 * @param pattern The content pattern to match between the boundaries (a `NamedRegExp` to type the captured data).
 * @param start The leading boundary pattern (defaults to `BLOCK_START_REGEXP`).
 * @param end The trailing boundary pattern (defaults to `BLOCK_END_REGEXP`).
 * @returns A `RegExp` (a `NamedRegExp<T>` when the content pattern names its capture groups).
 * @example createBlockRegExp("(?<quote>>[\\s\\S]*?)")
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/createBlockRegExp
 */
export function createBlockRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): NamedRegExp<T>;
export function createBlockRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function createBlockRegExp(
	content: PossibleRegExp,
	start: PossibleRegExp = BLOCK_START_REGEXP,
	end: PossibleRegExp = BLOCK_END_REGEXP,
): RegExp {
	return new RegExp(`${start}${getRegExpSource(content)}${end}`, "u");
}

/**
 * Create a `RegExp` that matches a single line of content, wrapped between line-start and line-end boundaries.
 *
 * *Factory for `RegExp`.*
 *
 * @param pattern The content pattern to match between the boundaries (a `NamedRegExp` to type the captured data).
 * @param start The leading boundary pattern (defaults to `LINE_START_REGEXP`).
 * @param end The trailing boundary pattern (defaults to `LINE_END_REGEXP`).
 * @returns A `RegExp` (a `NamedRegExp<T>` when the content pattern names its capture groups).
 * @example createLineRegExp("(?<prefix>#{1,6})")
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/createLineRegExp
 */
export function createLineRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function createLineRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function createLineRegExp(
	content: PossibleRegExp = LINE_CONTENT_REGEXP,
	end: PossibleRegExp = LINE_END_REGEXP,
	start: PossibleRegExp = LINE_START_REGEXP,
): RegExp {
	return new RegExp(`${start}${getRegExpSource(content)}${end}`, "u");
}

/**
 * Create a `RegExp` that matches a word of content, wrapped between word-start and word-end boundaries.
 *
 * *Factory for `RegExp`.*
 *
 * @param pattern The content pattern to match between the boundaries (a `NamedRegExp` to type the captured data).
 * @param start The leading boundary pattern (defaults to `WORD_START_REGEXP`).
 * @param end The trailing boundary pattern (defaults to `WORD_END_REGEXP`).
 * @returns A `RegExp` (a `NamedRegExp<T>` when the content pattern names its capture groups).
 * @example createWordRegExp("(?<char>[*_])+")
 * @see https://dhoulb.github.io/shelving/markup/util/regexp/createWordRegExp
 */
export function createWordRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function createWordRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function createWordRegExp(
	content: PossibleRegExp = WORD_CONTENT_REGEXP,
	start: PossibleRegExp = WORD_START_REGEXP,
	end: PossibleRegExp = WORD_END_REGEXP,
): RegExp {
	return new RegExp(`${start}${getRegExpSource(content)}${end}`, "u");
}
