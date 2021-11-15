import { StringSchema } from "./StringSchema.js";
import type { SchemaOptions } from "./Schema.js";

type KeySchemaOptions = SchemaOptions<string> & {
	readonly value?: string;
	readonly required?: boolean;
	readonly min?: number;
	readonly max?: number | null;
};

/**
 * Type of `StringSchema` that defines a valid database key.
 * - Minimum key length is 1 character.
 * - Maximum key length is 64 characters.
 */
export class KeySchema extends StringSchema<string> {
	static override REQUIRED = new KeySchema({ required: true });
	static override OPTIONAL = new KeySchema({ required: false });

	static override create(options: KeySchemaOptions): KeySchema {
		return new KeySchema(options);
	}

	override readonly multiline = false;
	override readonly min = 1;
	override readonly max = 64;
}
