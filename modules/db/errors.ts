import type { Feedback } from "../feedback";
import { ValidationError, RequiredError } from "../errors";
import type { Reference } from "./Reference";

/** Error thrown when a collection document doesn't validate. */
export class ReferenceValidationError extends ValidationError {
	reference: Reference;
	constructor(reference: Reference, feedback: Feedback, value: unknown) {
		super(`Invalid value for: "${reference.path}"`, feedback, value);
		this.reference = reference;
	}
}

/** Error thrown when a document doesn't exist. */
export class ReferenceRequiredError extends RequiredError {
	reference: Reference;
	constructor(reference: Reference) {
		super(`Path does not exist: "${reference.path}"`);
		this.reference = reference;
	}
}
