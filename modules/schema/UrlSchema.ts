import { InvalidFeedback } from "../feedback/index.js";
import { StringSchema } from "./StringSchema.js";
import type { SchemaOptions } from "./Schema.js";

type UrlSchemaOptions = SchemaOptions<string> & {
	readonly schemes?: string[];
	readonly hosts?: string[] | null;
	readonly value?: string;
	readonly required?: boolean;
};

/**
 * Type of `StringSchema` that defines a valid URL.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 * - Falsy values are converted to `""` empty string.
 */
export class UrlSchema extends StringSchema<string> {
	static override REQUIRED = new UrlSchema({ required: true });
	static override OPTIONAL = new UrlSchema({ required: false });

	static override create(options: UrlSchemaOptions): UrlSchema {
		return new UrlSchema(options);
	}

	override readonly type = "url";
	override readonly max = 512;
	readonly schemes: string[] = ["http:", "https:"];
	readonly hosts: string[] | null = null;

	protected constructor({ schemes = ["http:", "https:"], hosts = null, ...rest }: UrlSchemaOptions = {}) {
		super(rest);
		this.schemes = schemes;
		this.hosts = hosts;
	}

	override sanitize(uncleanString: string): string {
		const cleanString = super.sanitize(uncleanString);
		if (!cleanString) return cleanString;

		// Parse the URL using URL class (available in Node 10 and modern browsers).
		let url: URL;
		try {
			// Try to parse. Automatically prepend `http://` if there's no `:` anywhere.
			url = new URL(cleanString.includes(":") ? cleanString : `http://${cleanString}`);
		} catch (e) {
			// Definitely not valid.
			throw new InvalidFeedback("Invalid format", { value: uncleanString });
		}

		// Check scheme and domain exist in whitelists.
		if (!this.schemes.includes(url.protocol)) throw new InvalidFeedback(`Scheme "${url.protocol}" is not allowed`, { value: cleanString });
		if (this.hosts && !this.hosts.includes(url.host)) throw new InvalidFeedback(`Domain "${url.host}" is not allowed`, { value: cleanString });

		// Check host.
		if (url.host.length) {
			// No more than 253 total characters for a host.
			if (url.host.length > 253) throw new InvalidFeedback("Invalid host", { value: cleanString });
			// Each host segment is no more than 63 characters.
			const bits = url.host.split(".");
			for (const bit of bits) if (bit.length > 63) throw new InvalidFeedback("Invalid host", { value: cleanString });
		}

		// Return the clean URL.
		return url.href;
	}
}
