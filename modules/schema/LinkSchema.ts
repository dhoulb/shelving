import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { getOptionalURL } from "../util/url.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema, StringSchemaOptions } from "./StringSchema.js";

/**
 * Type of `StringSchema` that defines a valid URL.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 * - Falsy values are converted to `""` empty string.
 */
export class LinkSchema extends StringSchema {
	override readonly type = "url";
	override readonly min = 1;
	override readonly max = 512;
	readonly schemes: string[] = ["http:", "https:"];
	readonly hosts: string[] | null = null;
	constructor({
		schemes = ["http:", "https:"],
		hosts = null,
		...rest
	}: StringSchemaOptions & {
		readonly schemes?: string[];
		readonly hosts?: string[] | null;
	}) {
		super(rest);
		this.schemes = schemes;
		this.hosts = hosts;
	}
	// Override to clean the URL using the builtin `URL` class and check the schemes and hosts against the whitelists.
	override validate(unsafeValue: unknown): string {
		const string = super.validate(unsafeValue);
		const url = getOptionalURL(super.sanitize(string));
		if (!url) throw new InvalidFeedback(string ? "Invalid format" : "Required", { value: string });
		if (!this.schemes.includes(url.protocol)) throw new InvalidFeedback(`Scheme "${url.protocol}" is not allowed`, { value: string });
		if (this.hosts && !this.hosts.includes(url.host)) throw new InvalidFeedback(`Domain "${url.host}" is not allowed`, { value: string });
		return url.href;
	}
}

/** Valid link, e.g. `https://www.google.com` */
export const LINK = new LinkSchema({});

/** Valid link, e.g. `https://www.google.com`, or `null` */
export const OPTIONAL_LINK = OPTIONAL(LINK);
