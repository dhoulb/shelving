import type { FileTypes } from "../util/file.js";
import { getFileExtension } from "../util/file.js";
import { isProp } from "../util/object.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/**
 * Allowed options for `FileSchema`.
 *
 * @see https://shelving.cc/schema/FileSchemaOptions
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
 * @see https://shelving.cc/schema/FileSchema
 */
export class FileSchema extends StringSchema {
	/** Set of allowed file extensions; when set, the file name's extension must be one of these. */
	readonly types: FileTypes | undefined;

	constructor({ one = "file", title = "File", types, ...options }: FileSchemaOptions) {
		super({ one, title, ...options });
		this.types = types;
	}

	/** Additionally requires a file extension and, when `types` is set, one within it. */
	override validate(unsafeValue: unknown = this.value): string {
		const path = super.validate(unsafeValue);
		const extension = getFileExtension(path);
		if (!extension) throw `Must have extension`;
		if (this.types && !isProp(this.types, extension)) throw `Invalid extension`;
		return path;
	}
}

/**
 * Sugar instance of `FileSchema` for a file name, e.g. `file.txt`. Equivalent to `new FileSchema({})`.
 *
 * @example FILE.validate("file.txt"); // Returns "file.txt"
 * @see https://shelving.cc/schema/FILE
 */
export const FILE = new FileSchema({});

/**
 * Sugar instance allowing a `FILE` or `null`. Equivalent to `NULLABLE(FILE)`.
 *
 * @example NULLABLE_FILE.validate(null); // Returns null
 * @see https://shelving.cc/schema/NULLABLE_FILE
 */
export const NULLABLE_FILE = NULLABLE(FILE);
