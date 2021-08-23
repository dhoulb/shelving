import type { Data } from "../util";
import { RequiredError, ValidationError } from "../errors";
import type { Feedback } from "../feedback";
import type { Document } from "./Document";
import type { Reference } from "./Reference";

/** Thrown if a `Document` doesn't exist. */
export class ReferenceRequiredError<T extends Data = Data> extends RequiredError {
	ref: Document<T>;
	constructor(ref: Document<T>) {
		super(`Document "${ref.path}" is required`);
		this.ref = ref;
	}
}
ReferenceRequiredError.prototype.name = "DocumentRequiredError";

/** Thrown if a `Document` or `Documents` can't validate. */
export class ReferenceValidationError<T extends Data = Data> extends ValidationError {
	ref: Reference<T>;
	constructor(ref: Reference<T>, feedback: Feedback) {
		super(`Invalid data for "${ref.path}"`, feedback);
		this.ref = ref;
	}
}
ReferenceValidationError.prototype.name = "ReferenceValidationError";
