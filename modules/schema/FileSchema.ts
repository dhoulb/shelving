import type { FileTypes } from "../util/file.js";
import { getFileExtension } from "../util/file.js";
import { isProp } from "../util/object.js";
import { NULLABLE } from "./NullableSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/** Allowed options for `FileSchema` */
export interface FileSchemaOptions extends StringSchemaOptions {
	readonly types?: FileTypes | undefined;
}

/** Validate a file name matching one or more extensions. */
export class FileSchema extends StringSchema {
	readonly types: FileTypes | undefined;
	constructor({ one = "file", title = "File", types, ...options }: FileSchemaOptions) {
		super({ one, title, ...options });
		this.types = types;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const path = super.validate(unsafeValue);
		const extension = getFileExtension(path);
		if (!extension) throw "Must be file name with extension";
		if (this.types && !isProp(this.types, extension)) throw "Invalid file type";
		return path;
	}
}

/** Valid file, e.g. `file.txt` */
export const FILE = new FileSchema({});

/** Valid optional file, e.g. `file.txt`, or `null` */
export const NULLABLE_FILE = NULLABLE(FILE);
