import { formatURI } from "../util/format.js";
import { sanitizeWord } from "../util/string.js";
import { getURI, HTTP_SCHEMES, type URISchemes, type URIString } from "../util/uri.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

/**
 * Options for `URISchema`.
 *
 * - The length and single-line constraints are fixed internally, so only the presentation-level string options plus `schemes` are exposed.
 *
 * @see https://dhoulb.github.io/shelving/schema/URISchema/URISchemaOptions
 */
export interface URISchemaOptions extends SchemaOptions {
	/** Default string value used when the input is `undefined`. */
	readonly value?: string | undefined;
	/**
	 * Maximum allowed character length.
	 * @default 512
	 */
	readonly max?: number | undefined;
	/** Regular expression the sanitized string must match. */
	readonly match?: RegExp | undefined;
	/** Force the result to `"upper"` or `"lower"` case. */
	readonly case?: "upper" | "lower" | undefined;
	/**
	 * HTML `<input />` `type=""` hint for downstream UIs.
	 * @default "url"
	 */
	readonly input?: StringInputType | undefined;
	/**
	 * Whitelist of allowed URI schemes.
	 * @default HTTP_SCHEMES
	 */
	readonly schemes?: URISchemes | undefined;
}

/**
 * Schema that defines a valid absolute URI string.
 *
 * - Checks the URI scheme against a whitelist (always).
 * - URIs are limited to 512 characters, but generally these won't be `data:` URIs so this is a reasonable limit.
 *
 * @example
 * 	const schema = new URISchema({});
 * 	schema.validate("https://www.google.com") // "https://www.google.com/"
 * @see https://dhoulb.github.io/shelving/schema/URISchema/URISchema
 */
export class URISchema extends StringSchema {
	/** Whitelist of allowed URI schemes, e.g. `["https:", "http:"]`. */
	readonly schemes: URISchemes;

	/**
	 * Create a new `URISchema`.
	 */
	constructor({ one = "URI", title = "URI", schemes = HTTP_SCHEMES, input = "url", max = 512, ...options }: URISchemaOptions) {
		super({
			one,
			title,
			...options,
			input,
			max,
			min: 1,
			rows: 1,
		});
		this.schemes = schemes;
	}
	/**
	 * Validate an unknown input value and return a normalised absolute URI string.
	 *
	 * - Override to validate the URI and check the scheme against the whitelist.
	 *
	 * @param unsafeValue The unknown input value to validate.
	 * @returns The valid, normalised URI string.
	 * @throws `string` error message if the value is empty, malformed, or uses a disallowed scheme.
	 * @example schema.validate("https://www.google.com") // "https://www.google.com/"
	 * @see https://dhoulb.github.io/shelving/schema/URISchema/URISchema/validate
	 */
	override validate(unsafeValue: unknown): URIString {
		const str = super.validate(unsafeValue);
		const uri = getURI(str);
		if (!uri) throw str ? `Invalid ${this.one} format` : "Required";
		if (this.schemes && !this.schemes.includes(uri.protocol)) throw `Invalid ${this.one} scheme`;
		return uri.href;
	}

	/**
	 * Sanitize a string before validation by stripping all whitespace.
	 *
	 * - URIs never contain whitespace (a real space must be `%20`-encoded), so strip it entirely.
	 *
	 * @param str The raw string to sanitize.
	 * @returns The sanitized string with all whitespace removed.
	 * @example schema.sanitize(" https://a.com ") // "https://a.com"
	 * @see https://dhoulb.github.io/shelving/schema/URISchema/URISchema/sanitize
	 */
	override sanitize(str: string): string {
		// URIs never contain whitespace (a real space must be `%20`-encoded), so strip it entirely.
		return sanitizeWord(str);
	}

	/**
	 * Format a validated URI string for display.
	 *
	 * @param value The valid URI string to format.
	 * @returns The URI formatted as a human-readable string.
	 * @example schema.format("https://www.google.com/") // "www.google.com"
	 * @see https://dhoulb.github.io/shelving/schema/URISchema/URISchema/format
	 */
	override format(value: string): string {
		return formatURI(value, this.format);
	}
}

/**
 * Sugar instance of `URISchema` for an absolute URI string. Equivalent to `new URISchema({})`.
 *
 * @example URI_SCHEMA.validate("https://www.google.com") // "https://www.google.com/"
 * @see https://dhoulb.github.io/shelving/schema/URISchema/URI_SCHEMA
 */
export const URI_SCHEMA = new URISchema({});

/**
 * Sugar instance allowing a `URI_SCHEMA` or `null`. Equivalent to `NULLABLE(URI_SCHEMA)`.
 *
 * @example NULLABLE_URI_SCHEMA.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/URISchema/NULLABLE_URI_SCHEMA
 */
export const NULLABLE_URI_SCHEMA = NULLABLE(URI_SCHEMA);
