import { formatURI } from "../util/format.js";
import { sanitizeWord } from "../util/string.js";
import { getURI, HTTP_SCHEMES, type URISchemes, type URIString } from "../util/uri.js";
import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/**
 * Options for a [`URISchema`](/schema/URISchema).
 *
 * Inherits [`StringSchemaOptions`](/schema/StringSchema/StringSchemaOptions) except `min` and `rows`, which are fixed because the URI format is enforced internally.
 *
 * @see https://dhoulb.github.io/shelving/schema/URISchema/URISchemaOptions
 */
export interface URISchemaOptions extends Omit<StringSchemaOptions, "min" | "rows"> {
	/**
	 * Whitelist of allowed URI schemes.
	 * @default HTTP_SCHEMES `["https:", "http:"]`
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
	 *
	 * @param options Options for the schema (`schemes`, plus inherited string options like `one`, `title`, `value`, `input`, `max`).
	 * @param options.input HTML `<input />` `type=""` hint (defaults to `"url"`).
	 * @param options.max Maximum allowed character length (defaults to `512`).
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
 * Sugar instance of [`URISchema`](/schema/URISchema) for an absolute URI string. Equivalent to `new URISchema({})`.
 *
 * @example URI_SCHEMA.validate("https://www.google.com") // "https://www.google.com/"
 * @see https://dhoulb.github.io/shelving/schema/URISchema/URI_SCHEMA
 */
export const URI_SCHEMA = new URISchema({});

/**
 * Sugar instance allowing a [`URI_SCHEMA`](/schema/URI_SCHEMA) or `null`. Equivalent to `NULLABLE(URI_SCHEMA)`.
 *
 * @example NULLABLE_URI_SCHEMA.validate(null) // null
 * @see https://dhoulb.github.io/shelving/schema/URISchema/NULLABLE_URI_SCHEMA
 */
export const NULLABLE_URI_SCHEMA = NULLABLE(URI_SCHEMA);
