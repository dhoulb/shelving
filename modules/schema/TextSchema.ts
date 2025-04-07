import { ValueFeedback } from "../feedback/Feedback.js";
import { sanitizeMultilineText, sanitizeText } from "../util/string.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { type Sanitizer, StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/** `type=""` prop for HTML `<input />` tags that are relevant for strings. */

export type TextSchemaType = "text" | "password" | "color" | "date" | "email" | "number" | "tel" | "search" | "url";
/** Options for `TextSchema` */

export interface TextSchemaOptions extends StringSchemaOptions {
	readonly type?: TextSchemaType | undefined;
	readonly match?: RegExp | undefined;
	readonly multiline?: boolean | undefined;
}

/**
 * Schema that defines a valid text string.
 *
 * Ensures value is string and optionally enforces min/max length, whether to trim whitespace, and regex match format.
 * Doesn't allow `null` to mean no value — empty string is the equivalent for StringSchema (because it means we'll never accidentally get `"null"` by converting the `null` to string).
 *
 * Defaults to a single line text string (newlines are stripped). Use `multiline=true` to allow newlines.
 */
export class TextSchema extends StringSchema {
	readonly type: TextSchemaType;
	readonly match: RegExp | undefined;
	readonly sanitizer: Sanitizer | undefined;
	readonly multiline: boolean;
	constructor({ type = "text", match, multiline = false, ...options }: TextSchemaOptions) {
		super(options);
		this.type = type;
		this.match = match;
		this.multiline = multiline;
	}

	override validate(unsafeValue: unknown = this.value): string {
		const str = super.validate(unsafeValue);
		if (this.match && !this.match.test(str)) throw new ValueFeedback(str ? "Invalid format" : "Required", str);
		return str;
	}

	override sanitize(str: string): string {
		return this.multiline ? sanitizeMultilineText(str) : sanitizeText(str);
	}
}

/** Valid text, e.g. `Hello there!` */
export const TEXT = new TextSchema({ title: "Text" });

/** Valid text, `Hello there!`, with more than one character. */
export const REQUIRED_TEXT = new TextSchema({ min: 1 });

/** Title string, e.g. `Title of something` */
export const TITLE = new TextSchema({ title: "Title", min: 1, max: 100 });

/** Optional name string, e.g. `Title of something` or `null` */
export const OPTIONAL_TITLE = OPTIONAL(TITLE);

/** Name string, e.g. `Name of Something` */
export const NAME = new TextSchema({ title: "Name", min: 1, max: 100 });

/** Optional name string, e.g. `Name of Something` or `null` */
export const OPTIONAL_NAME = OPTIONAL(NAME);

/** Password string. */
export const PASSWORD = new TextSchema({ title: "Password", min: 6, type: "password" });
