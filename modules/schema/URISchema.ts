import { ValueFeedback } from "../feedback/Feedback.js";
import type { ImmutableArray } from "../util/array.js";
import { getURI, type URIString } from "../util/uri.js";
import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/**
 * List of allowed schemes for a URI string.
 * @example ["http:", "https:", "mailto:"]
 */
export type URISchemes = ImmutableArray<string>;

/**
 * List of allowed hosts for a URI string.
 * @example ["google.com", "www.google.com"]
 */
export type URIHosts = ImmutableArray<string>;

/** Allowed options for `URISchema` */
export interface URISchemaOptions extends Omit<StringSchemaOptions, "input" | "min" | "max" | "multiline"> {
	readonly schemes?: URISchemes | undefined;
}

/** Default whitelist for URI schemes. */
const HTTP_SCHEMES: URISchemes = ["http:", "https:"];

/**
 * Type of `StringSchema` that defines a valid URI string.
 * - Checks URI scheme against a whitelist (always).
 * - URIs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 */
export class URISchema extends StringSchema {
	readonly base: URIString | undefined;
	readonly schemes: URISchemes;
	readonly hosts: URIHosts | undefined;
	constructor({ one = "URI", title = "URI", schemes = HTTP_SCHEMES, ...options }: URISchemaOptions) {
		super({
			one,
			title,
			...options,
			input: "url",
			min: 1,
			max: 512,
			multiline: false,
		});
		this.schemes = schemes;
	}
	// Override to validate the URI and check the schemes and hosts against the whitelists.
	override validate(unsafeValue: unknown): URIString {
		const str = super.validate(unsafeValue);
		const uri = getURI(str);
		if (!uri) throw new ValueFeedback(str ? "Invalid format" : "Required", str);
		if (this.schemes && !this.schemes.includes(uri.protocol)) throw new ValueFeedback("Invalid URI scheme", str);
		return uri.href;
	}
}

/** Valid URI string, e.g. `https://www.google.com` */
export const URI_SCHEMA = new URISchema({});

/** Valid URI string, e.g. `https://www.google.com`, or `null` */
export const NULLABLE_URI_SCHEMA = NULLABLE(URI_SCHEMA);
