import { StringSchema } from "./StringSchema";
import type { SchemaOptions } from "./Schema";

type KeySchemaOptions = SchemaOptions<string> & {
	readonly min?: number;
	readonly max?: number | null;
	readonly value?: string;
};

/**
 * Type of `StringSchema` that defines a valid database key.
 * - Minimum key length is 1 character.
 * - Maximum key length is 64 characters.
 */
export class KeySchema extends StringSchema<string> {
	static REQUIRED = new KeySchema({ required: true });
	static OPTIONAL = new KeySchema({ required: false });

	static create(options: KeySchemaOptions): KeySchema {
		return new KeySchema(options);
	}

	readonly multiline = false;
	readonly min = 1;
	readonly max = 64;
}
