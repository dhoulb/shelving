import type { StringSchemaOptions } from "./StringSchema.js";
import { Feedback } from "../feedback/Feedback.js";
import { getOptionalURL } from "../util/url.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema } from "./StringSchema.js";

/** Allowed options for `LinkSchema` */
export type LinkSchemaOptions = Omit<StringSchemaOptions, "type" | "min" | "max" | "multiline"> & {
	readonly schemes?: string[] | undefined;
	readonly hosts?: string[] | undefined;
};

/**
 * Type of `StringSchema` that defines a valid URL.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 * - Falsy values are converted to `""` empty string.
 */
export class LinkSchema extends StringSchema {
	readonly schemes: string[];
	readonly hosts: string[] | undefined;
	constructor(options: LinkSchemaOptions) {
		super({
			title: "Link",
			...options,
			type: "url",
			min: 1,
			max: 512,
			multiline: false,
		});
		this.schemes = options.schemes || ["http:", "https:"];
		this.hosts = options.hosts;
	}
	// Override to clean the URL using the builtin `URL` class and check the schemes and hosts against the whitelists.
	override validate(unsafeValue: unknown): string {
		const unsafeString = super.validate(unsafeValue);
		const optionalURL = getOptionalURL(super.sanitize(unsafeString));
		if (!optionalURL) throw new Feedback(unsafeString ? "Invalid format" : "Required", unsafeString);
		if (!this.schemes.includes(optionalURL.protocol)) throw new Feedback(`Scheme "${optionalURL.protocol}" is not allowed`, unsafeString);
		if (this.hosts && !this.hosts.includes(optionalURL.host)) throw new Feedback(`Domain "${optionalURL.host}" is not allowed`, unsafeString);
		return optionalURL.href;
	}
}

/** Valid link, e.g. `https://www.google.com` */
export const LINK = new LinkSchema({});

/** Valid link, e.g. `https://www.google.com`, or `null` */
export const OPTIONAL_LINK = OPTIONAL(LINK);
