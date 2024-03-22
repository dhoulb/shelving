import type { FileTypes } from "../util/file.js";
import { ValueFeedback } from "../feedback/Feedback.js";
import { getOptionalFileExtension } from "../util/file.js";
import { isProp } from "../util/object.js";
import { OPTIONAL } from "./OptionalSchema.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/** Allowed options for `FileSchema` */
export interface FileSchemaOptions extends StringSchemaOptions {
	readonly types?: FileTypes | undefined;
}

/** Validate a file name matching one or more extensions. */
export class FileSchema extends StringSchema {
	readonly types: FileTypes | undefined;
	constructor({ types, title = "File", ...options }: FileSchemaOptions) {
		super({ title, ...options });
		this.types = types;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const path = super.validate(unsafeValue);
		const extension = getOptionalFileExtension(path);
		if (!extension) throw new ValueFeedback("Must be file name with extension", unsafeValue);
		if (this.types && !isProp(this.types, extension)) throw new ValueFeedback("Invalid file type", extension);
		return path;
	}
}

/** Valid file, e.g. `file.txt` */
export const FILE = new FileSchema({});

/** Valid optional file, e.g. `file.txt`, or `null` */
export const OPTIONAL_FILE = OPTIONAL(FILE);
