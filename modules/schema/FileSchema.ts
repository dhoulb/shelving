import type { FileTypes } from "../util/file.js";
import { getFileExtension } from "../util/file.js";
import { isProp } from "../util/object.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Allowed options for `FileSchema`.
 *
 * @see https://dhoulb.github.io/shelving/schema/FileSchema/FileSchemaOptions
 */
export interface FileSchemaOptions extends StringSchemaOptions {
	/** Set of allowed file extensions; when set, the file name's extension must be one of these. */
	readonly types?: FileTypes | undefined;
}

/**
 * Schema that validates a file name matching one or more extensions.
 *
 * - Requires the file name to have an extension.
 * - When `types` is set, the extension must be one of the allowed `FileTypes`.
 *
 * @example FILE.validate("photo.jpg"); // Returns "photo.jpg"
 * @see https://dhoulb.github.io/shelving/schema/FileSchema/FileSchema
 */
export class FileSchema extends StringSchema {
	/** Set of allowed file extensions; when set, the file name's extension must be one of these. */
	readonly types: FileTypes | undefined;

	/**
	 * Create a new `FileSchema`.
	 *
	 * @param options Options for the schema (inherits all `StringSchema` options plus `types`).
	 * @param options.one Singular noun describing one value, used in error messages (defaults to `"file"`).
	 * @param options.title Title of the schema, e.g. for a corresponding field (defaults to `"File"`).
	 * @param options.types Set of allowed file extensions; when set, the extension must be one of these.
	 */
	constructor({ one = "file", title = "File", types, ...options }: FileSchemaOptions) {
		super({ one, title, ...options });
		this.types = types;
	}

	/**
	 * Validate an unknown value as a file name with a valid extension.
	 *
	 * @param unsafeValue Value to validate (defaults to this schema's `value`).
	 * @returns The validated file name.
	 * @throws `string` `` `Must have extension` `` if the file name has no extension, or `` `Invalid extension` `` if its extension isn't in `types`. Also throws the `string` messages from `StringSchema.validate()`.
	 * @example FILE.validate("photo.jpg"); // Returns "photo.jpg"
	 * @see https://dhoulb.github.io/shelving/schema/FileSchema/FileSchema/validate
	 */
	override validate(unsafeValue: unknown = this.value): string {
		const path = super.validate(unsafeValue);
		const extension = getFileExtension(path);
		if (!extension) throw `Must have extension`;
		if (this.types && !isProp(this.types, extension)) throw `Invalid extension`;
		return path;
	}
}

/**
 * Sugar instance of [`FileSchema`](/schema/FileSchema) for a file name, e.g. `file.txt`. Equivalent to `new FileSchema({})`.
 *
 * @example FILE.validate("file.txt"); // Returns "file.txt"
 * @see https://dhoulb.github.io/shelving/schema/FileSchema/FILE
 */
export const FILE = new FileSchema({});

/**
 * Sugar instance allowing a [`FILE`](/schema/FILE) or `null`. Equivalent to `NULLABLE(FILE)`.
 *
 * @example NULLABLE_FILE.validate(null); // Returns null
 * @see https://dhoulb.github.io/shelving/schema/FileSchema/NULLABLE_FILE
 */
export const NULLABLE_FILE = NULLABLE(FILE);
