import { InvalidFeedback } from "../feedback";
import type { RequiredOptions } from "./Schema";
import { StringOptionOptions, StringOptions, StringSchema } from "./StringSchema";

export type UrlOptions<T extends string> = StringOptions<T> & {
	readonly schemes?: string[];
	readonly hosts?: string[] | null;
};

/**
 * Type of `StringSchema` that defines a valid URL.
 * - Checks URL scheme against a whitelist (always), and checks URL domain against a whitelist (optional).
 * - URLs are limited to 512 characters, but generally these won't be data: URIs so this is a reasonable limit.
 * - Falsy values are converted to `""` empty string.
 */
export class UrlSchema<T extends string> extends StringSchema<T> {
	readonly schemes: string[] = ["http:", "https:"];
	readonly hosts: string[] | null = null;
	readonly max = 512;

	constructor({ schemes = ["http:", "https:"], hosts = null, ...rest }: UrlOptions<T> = {}) {
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
			throw new InvalidFeedback("Invalid format");
		}

		// Check scheme and domain exist in whitelists.
		if (!this.schemes.includes(url.protocol)) throw new InvalidFeedback(`Scheme "${url.protocol}" is not allowed`);
		if (this.hosts && !this.hosts.includes(url.host)) throw new InvalidFeedback(`Domain "${url.host}" is not allowed`);

		// Check domain.
		if (url.host.length) {
			// No more than 253 total characters for a host.
			if (url.host.length > 253) throw new InvalidFeedback(`Invalid format`);
			// Each host segment is no more than 63 characters.
			const bits = url.host.split(".");
			for (const bit of bits) if (bit.length > 63) throw new InvalidFeedback(`Invalid format`);
		}

		// Return the clean URL.
		return url.href;
	}
}

/** Shortcuts for UrlSchema. */
export const url: {
	<T extends string>(options: UrlOptions<T> & StringOptionOptions<T> & RequiredOptions): UrlSchema<T>;
	<T extends string>(options: UrlOptions<T> & StringOptionOptions<T>): UrlSchema<T | "">;
	(options: UrlOptions<string> & RequiredOptions): UrlSchema<string>;
	(options: UrlOptions<string>): UrlSchema<string | "">;
	required: UrlSchema<string>;
	optional: UrlSchema<string>;
} = Object.assign(<T extends string>(options: UrlOptions<T>): UrlSchema<T> => new UrlSchema<T>(options), {
	required: new UrlSchema<string>({ required: true }),
	optional: new UrlSchema<string>({ required: false }),
});
