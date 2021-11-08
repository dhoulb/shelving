import { Data, Feedback, RequiredError, ValidationError } from "../util/index.js";
import type { Document } from "./Document.js";
import type { Reference } from "./Reference.js";

/** Thrown if a `Document` doesn't exist. */
export class ReferenceRequiredError<T extends Data = Data> extends RequiredError {
	ref: Document<T>;
	constructor(ref: Document<T>) {
		super(`Document "${ref.path}" is required`);
		this.ref = ref;
	}
}

/** Thrown if a `Document` or `Documents` can't validate. */
export class ReferenceValidationError<T extends Data = Data> extends ValidationError {
	ref: Reference<T>;
	constructor(ref: Reference<T>, feedback: Feedback) {
		super(`Invalid data for "${ref.path}"`, feedback);
		this.ref = ref;
	}
}
