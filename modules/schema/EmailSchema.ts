import type { SchemaOptions } from "./Schema";
import { StringSchema } from "./StringSchema";

const R_MATCH = /^[a-z0-9](?:[a-zA-Z0-9._+-]{0,62}[a-zA-Z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.){1,3}(?:[a-z]{2,63}|xn--[a-z0-9-]{0,58}[a-z0-9])$/;

type EmailSchemaOptions = SchemaOptions<string> & {
	readonly value?: string;
};

/**
 * Type of `StringSchema` that defines a valid email address.
 * - Falsy values are converted to `""` empty string.
 * - Total length must be 254 characters or fewer (in SMTP email is encoded with `<` and `>` to make 256 characters).
 * - No minimum length is enforced because the email's format is enforced instead.
 * - RFC specifies username _should_ be case insensitive to avoid confusion.
 *     - We lowercase the entire address as a simple way to enforce this.
 *     - This is technically incorrect but practically better, and avoids case insensitive lookups in databases etc.
 * - Username portion must be 64 characters or fewer from the range `[a-z0-9.!#$%&’*+/=?^_`{|}~-]`
 *     - We subset this to `[a-z0-9._+-]` with no special characters at start/end (and we lowercase automatically).
 *     - If someone uses e.g. `*` asterisk at all or '-' at the start then it's most likely to be a mistake.
 * - Server portion must be a valid domain
 *     - Limited to `[a-z0-9]` with mid-word hyphens only.
 *     - Up to 10 segments of up to 63 characters each, separated by `.`
 *     - TLD is a segment of 2-63 characters, possibly in `xn--` international format.
 */
export class EmailSchema extends StringSchema<string> {
	static REQUIRED = new EmailSchema({ required: true });
	static OPTIONAL = new EmailSchema({ required: false });

	static create(options: EmailSchemaOptions): EmailSchema {
		return new EmailSchema(options);
	}

	readonly type = "email";
	readonly max = 254;
	readonly match = R_MATCH;
	readonly multiline = false;

	sanitize(str: string): string {
		const clean = super.sanitize(str);
		return typeof clean === "string" ? clean.toLowerCase() : clean;
	}
}
