import type { NamedRegExp, NamedRegExpData, PossibleRegExp } from "../../util/regexp.js";
import { getRegExpSource } from "../../util/regexp.js";

export const BLOCK_CONTENT_REGEXP = "[\\s\\S]*?"; // Block content (shortest run of any character).
export const BLOCK_SPACE_REGEXP = "\\s"; // Block whitespace (run of any whitespace character).
export const BLOCK_START_REGEXP = "(?:\\s*\\n|^)"; // Start of block (start of string, or one linebreak).
export const BLOCK_END_REGEXP = "\\s*(?:$|\\n\\s*\\n)"; // End of block (end of string, or two linebreaks, trimmed whitespace).

export const LINE_CONTENT_REGEXP = "[^\\n]*?"; // Line content (shortest run of any character except newline).
export const LINE_SPACE_REGEXP = "[^\\n\\S]"; // Line whitespace (run of any whitespace character except newline).
export const LINE_START_REGEXP = BLOCK_START_REGEXP; // Start of line (start of string, or one linebreak).
export const LINE_END_REGEXP = `${LINE_SPACE_REGEXP}*(?:\\s*\\n|$)`; // End of line (end of string, or one linebreak, trimmed whitespace).

export const WORD_CONTENT_REGEXP = "[\\p{L}\\p{N}]+"; // Word content (at least one character that is a letter or number).
export const WORD_START_REGEXP = "(?<![\\p{L}\\p{N}])"; // Start of word (previous character is not a letter or number).
export const WORD_END_REGEXP = "(?![\\p{L}\\p{N}])"; // End of word (next character is not a letter or number).

/** Create regular expression that matches a block of content. */
export function getBlockRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getBlockRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getBlockRegExp(
	content: PossibleRegExp,
	start: PossibleRegExp = BLOCK_START_REGEXP,
	end: PossibleRegExp = BLOCK_END_REGEXP,
): RegExp {
	return new RegExp(`${start}${getRegExpSource(content)}${end}`, "u");
}

/** Create regular expression that matches a line of content. */
export function getLineRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getLineRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getLineRegExp(
	content: PossibleRegExp = LINE_CONTENT_REGEXP,
	end: PossibleRegExp = LINE_END_REGEXP,
	start: PossibleRegExp = LINE_START_REGEXP,
): RegExp {
	return new RegExp(`${start}${getRegExpSource(content)}${end}`, "u");
}

/** Create regular expression that matches a word of content. */
export function getWordRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getWordRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	start?: PossibleRegExp,
	end?: PossibleRegExp,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getWordRegExp(
	content: PossibleRegExp = WORD_CONTENT_REGEXP,
	start: PossibleRegExp = WORD_START_REGEXP,
	end: PossibleRegExp = WORD_END_REGEXP,
): RegExp {
	return new RegExp(`${start}${getRegExpSource(content)}${end}`, "u");
}
