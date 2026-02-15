import { getURI, HTTP_SCHEMES, type URISchemes, type URIString } from "../util/uri.js";
import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/** Allowed options for `URISchema` */
export interface URISchemaOptions extends Omit<StringSchemaOptions, "input" | "min" | "max" | "multiline"> {
	readonly schemes?: URISchemes | undefined;
}

/**
 * Type of `StringSchema` that defines a valid URI string.
 * - Checks URI scheme against a whitelist (always).
 * - URIs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 */
export class URISchema extends StringSchema {
	readonly schemes: URISchemes;
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
		if (!uri) throw str ? "Invalid format" : "Required";
		if (this.schemes && !this.schemes.includes(uri.protocol)) throw "Invalid URI scheme";
		return uri.href;
	}
}

/** Valid URI string, e.g. `https://www.google.com` */
export const URI_SCHEMA = new URISchema({});

/** Valid URI string, e.g. `https://www.google.com`, or `null` */
export const NULLABLE_URI_SCHEMA = NULLABLE(URI_SCHEMA);
