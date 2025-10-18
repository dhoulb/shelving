import { ValueFeedback } from "../feedback/Feedback.js";
import type { ImmutableArray } from "../util/array.js";
import { type AbsoluteLink, getLinkURL } from "../util/link.js";
import { NULLABLE } from "./NullableSchema.js";
import type { StringSchemaOptions } from "./StringSchema.js";
import { StringSchema } from "./StringSchema.js";

/** Allowed options for `LinkSchema` */
export interface LinkSchemaOptions extends Omit<StringSchemaOptions, "input" | "min" | "max" | "multiline"> {
	readonly base?: AbsoluteLink | undefined;
	readonly schemes?: ImmutableArray<string> | undefined;
	readonly hosts?: ImmutableArray<string> | undefined;
}

/**
 * Type of `StringSchema` that defines a valid URL link.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 * - Falsy values are converted to `""` empty string.
 */
export class LinkSchema extends StringSchema {
	readonly base: AbsoluteLink | undefined;
	readonly schemes: ImmutableArray<string> | undefined;
	readonly hosts: ImmutableArray<string> | undefined;
	constructor({ one = "link", title = "Link", base, schemes, hosts, ...options }: LinkSchemaOptions) {
		super({
			one,
			title,
			...options,
			input: "url",
			min: 1,
			max: 512,
			multiline: false,
		});
		this.base = base;
		this.schemes = schemes;
		this.hosts = hosts;
	}
	// Override to clean the URL using builtin helper functions and check the schemes and hosts against the whitelists.
	override validate(unsafeValue: unknown): AbsoluteLink {
		const str = super.validate(unsafeValue);
		const url = getLinkURL(str, this.base, this.schemes, this.hosts);
		if (!url) throw new ValueFeedback(str ? "Invalid format" : "Required", str);
		return url.href;
	}
}

/** Valid link, e.g. `https://www.google.com` */
export const LINK = new LinkSchema({});

/** Valid link, e.g. `https://www.google.com`, or `null` */
export const NULLABLE_LINK = NULLABLE(LINK);
