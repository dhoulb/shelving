import { InvalidFeedback } from "../feedback";
import type { SchemaOptions } from "./Schema";
import { StringSchema } from "./StringSchema";

type UrlSchemaOptions = SchemaOptions<string> & {
	readonly schemes?: string[];
	readonly hosts?: string[] | null;
	readonly value?: string;
};

/**
 * Type of `StringSchema` that defines a valid URL.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 * - Falsy values are converted to `""` empty string.
 */
export class UrlSchema extends StringSchema<string> {
	static create(options: UrlSchemaOptions): UrlSchema {
		return new UrlSchema(options);
	}

	readonly type = "url";
	readonly schemes: string[] = ["http:", "https:"];
	readonly hosts: string[] | null = null;
	readonly max = 512;

	protected constructor({ schemes = ["http:", "https:"], hosts = null, ...rest }: UrlSchemaOptions = {}) {
		super(rest);
		this.schemes = schemes;
		this.hosts = hosts;
	}

	sanitize(uncleanString: string): string {
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
