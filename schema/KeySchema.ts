import type { RequiredOptions } from "./Schema";
import { StringOptionOptions, StringOptions, StringSchema } from "./StringSchema";

const R_MATCH = /[a-zA-Z0-9]{1,64}/;

/**
 * Type of `StringSchema` that defines a valid database key.
 * Ensures value is a non-empty string key matching `[a-zA-Z0-9]{1,64}`
 */
export class KeySchema<T extends string> extends StringSchema<T> {
	readonly match = R_MATCH;
	readonly multiline = false;
}

/** Shortcuts for KeySchema. */
export const key: {
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T> & RequiredOptions): KeySchema<T>;
	<T extends string>(options: StringOptions<T> & StringOptionOptions<T>): KeySchema<T | "">;
	(options: StringOptions<string> & RequiredOptions): KeySchema<string>;
	(options: StringOptions<string>): KeySchema<string | "">;
	required: KeySchema<string>;
	optional: KeySchema<string>;
} = Object.assign(<T extends string>(options: StringOptions<T>): KeySchema<T> => new KeySchema<T>(options), {
	required: new KeySchema({ required: true }),
	optional: new KeySchema({ required: false }),
});
