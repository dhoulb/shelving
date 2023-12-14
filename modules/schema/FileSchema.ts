import type { FileTypes } from "../util/file.js";
import { Feedback } from "../feedback/Feedback.js";
import { getOptionalFileExtension } from "../util/file.js";
import { isProp } from "../util/object.js";
import { getValidationContext } from "../util/validate.js";
import { StringSchema, type StringSchemaOptions } from "./StringSchema.js";

/** Allowed options for `FileSchema` */
export type FileSchemaOptions = StringSchemaOptions & {
	readonly formats: FileTypes;
};

/** Validate a file name matching one or more extensions. */
export class FileSchema extends StringSchema {
	readonly formats: FileTypes;
	constructor(options: { formats: FileTypes } & StringSchemaOptions) {
		super(options);
		this.formats = options.formats;
	}
	override validate(unsafeValue: unknown = this.value): string {
		const path = super.validate(unsafeValue);
		const { action } = getValidationContext();
		if (action === "set" || action === "update") {
			const extension = getOptionalFileExtension(path);
			if (!extension) throw new Feedback("Must be file name with extension", unsafeValue);
			if (!isProp(this.formats, extension)) throw new Feedback("Invalid file type", extension);
		}
		return path;
	}
}
