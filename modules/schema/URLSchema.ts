import { ValueFeedback } from "../feedback/Feedback.js";
import type { ImmutableArray } from "../util/array.js";
import { getURL, type URLString } from "../util/url.js";
import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/**
 * List of allowed schemes for a URL string.
 * @example ["http:", "https:", "mailto:"]
 */
export type URLSchemes = ImmutableArray<string>;

/**
 * List of allowed hosts for a URL string.
 * @example ["google.com", "www.google.com"]
 */
export type URLHosts = ImmutableArray<string>;

/** Allowed options for `URLSchema` */
export interface URLSchemaOptions extends Omit<StringSchemaOptions, "input" | "min" | "max" | "multiline"> {
	readonly base?: URL | URLString | undefined;
	readonly schemes?: URLSchemes | undefined;
	readonly hosts?: URLHosts | undefined;
}

/** Default whitelist for URL schemes. */
const HTTP_SCHEMES: URLSchemes = ["http:", "https:"];

/**
 * Type of `StringSchema` that defines a valid URL string.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 */
export class URLSchema extends StringSchema {
	readonly base: URLString | undefined;
	readonly schemes: URLSchemes;
	readonly hosts: URLHosts | undefined;
	constructor({ one = "URL", title = "URL", base, schemes = HTTP_SCHEMES, hosts, ...options }: URLSchemaOptions) {
		super({
			one,
			title,
			...options,
			input: "url",
			min: 1,
			max: 512,
			multiline: false,
		});
		this.base = getURL(base)?.href;
		this.schemes = schemes;
		this.hosts = hosts;
	}
	// Override to validate the URL and check the schemes and hosts against the whitelists.
	override validate(unsafeValue: unknown): URLString {
		const str = super.validate(unsafeValue);
		const url = getURL(str, this.base);
		if (!url) throw new ValueFeedback(str ? "Invalid format" : "Required", str);
		if (this.schemes && !this.schemes.includes(url.protocol)) throw new ValueFeedback("Invalid URL scheme", str);
		if (this.hosts && !this.hosts.includes(url.host)) throw new ValueFeedback("Invalid URL host", str);
		return url.href;
	}
}

/** Valid URL string, e.g. `https://www.google.com` */
export const URL_SCHEMA = new URLSchema({});

/** Valid URL string, e.g. `https://www.google.com`, or `null` */
export const NULLABLE_URL_SCHEMA = NULLABLE(URL_SCHEMA);
