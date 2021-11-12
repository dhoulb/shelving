import { Data, Feedback, RequiredError, ValidationError } from "../util/index.js";
import type { Reference } from "./Reference.js";

/** Thrown if a `Document` or `Documents` doesn't exist. */
export class ReferenceRequiredError<T extends Data = Data> extends RequiredError {
	ref: Reference<T>;
	constructor(ref: Reference<T>) {
		super(`Reference "${ref.path}" does not exist`);
		this.ref = ref;
	}
}
ReferenceRequiredError.prototype.name = "ReferenceRequiredError";

/** Thrown if a `Document` or `Documents` can't validate. */
export class ReferenceValidationError<T extends Data = Data> extends ValidationError {
	ref: Reference<T>;
	constructor(ref: Reference<T>, feedback: Feedback) {
		super(`Invalid data for "${ref.path}"`, feedback);
		this.ref = ref;
	}
}
ReferenceValidationError.prototype.name = "ReferenceValidationError";
