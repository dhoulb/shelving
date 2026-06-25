import { formatURL } from "../util/format.js";
import { sanitizeWord } from "../util/string.js";
import { HTTP_SCHEMES, type URISchemes } from "../util/uri.js";
import { getURL, type URLString } from "../util/url.js";
import { NULLABLE } from "./NullableSchema.js";
import type { SchemaOptions } from "./Schema.js";
import { type StringInputType, StringSchema } from "./StringSchema.js";

/**
 * Options for `URLSchema`.
 *
 * - The length and single-line constraints are fixed internally, so only the presentation-level string options plus `base` and `schemes` are exposed.
 *
 * @see https://shelving.cc/schema/URLSchemaOptions
 */
export interface URLSchemaOptions extends SchemaOptions {
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
	/** Base URL that relative URLs are resolved against. */
	readonly base?: URL | URLString | undefined;
	/**
	 * Whitelist of allowed URL schemes.
	 * @default HTTP_SCHEMES
	 */
	readonly schemes?: URISchemes | undefined;
}

/**
 * Schema that defines a valid absolute or relative URL string.
 *
 * - Checks the URL scheme against a whitelist (always), and resolves relative URLs against `base` when set.
 * - URLs are limited to 512 characters, but generally these won't be `data:` URIs so this is a reasonable limit.
 *
 * @example
 * 	const schema = new URLSchema({ base: "https://example.com" });
 * 	schema.validate("/page") // "https://example.com/page"
 * @see https://shelving.cc/schema/URLSchema
 */
export class URLSchema extends StringSchema {
	/** Base URL that relative URLs are resolved against, or `undefined` when not set. */
	readonly base: URLString | undefined;
	/** Whitelist of allowed URL schemes, e.g. `["https:", "http:"]`. */
	readonly schemes: URISchemes;

	constructor({ one = "URL", title = "URL", base, schemes = HTTP_SCHEMES, input = "url", max = 512, ...options }: URLSchemaOptions) {
		super({
			one,
			title,
			...options,
			input,
			max,
			min: 1,
			rows: 1,
		});
		this.base = getURL(base)?.href;
		this.schemes = schemes;
	}
	/** Resolves the URL against `base`, then checks its scheme against `schemes`. */
	override validate(unsafeValue: unknown): URLString {
		const str = super.validate(unsafeValue);
		const url = getURL(str, this.base);
		if (!url) throw str ? `Invalid ${this.one} format` : "Required";
		if (this.schemes && !this.schemes.includes(url.protocol)) throw `Invalid ${this.one} scheme`;
		return url.href;
	}

	/** Strips all whitespace (URLs `%20`-encode real spaces). */
	override sanitize(str: string): string {
		// URLs never contain whitespace (a real space must be `%20`-encoded), so strip it entirely.
		return sanitizeWord(str);
	}

	/** Formats the URL for display via `formatURL()`. */
	override format(value: string): string {
		return formatURL(value, this.base, this.format);
	}
}

/**
 * Sugar instance of `URLSchema` for an absolute or relative URL string. Equivalent to `new URLSchema({})`.
 *
 * @example URL_SCHEMA.validate("https://www.google.com") // "https://www.google.com/"
 * @see https://shelving.cc/schema/URL_SCHEMA
 */
export const URL_SCHEMA = new URLSchema({});

/**
 * Sugar instance allowing a `URL_SCHEMA` or `null`. Equivalent to `NULLABLE(URL_SCHEMA)`.
 *
 * @example NULLABLE_URL_SCHEMA.validate(null) // null
 * @see https://shelving.cc/schema/NULLABLE_URL_SCHEMA
 */
export const NULLABLE_URL_SCHEMA = NULLABLE(URL_SCHEMA);
