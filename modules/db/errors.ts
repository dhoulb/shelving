import { Data, Feedback, RequiredError, ValidationError } from "../util/index.js";
import type { ModelDocument, ModelQuery } from "./Model.js";

/** Thrown if a document doesn't exist. */
export class DocumentRequiredError<T extends Data = Data> extends RequiredError {
	ref: ModelDocument<T>;
	constructor(ref: ModelDocument<T>) {
		super(`Document "${ref.toString()}" does not exist`);
		this.ref = ref;
	}
}
DocumentRequiredError.prototype.name = "DocumentRequiredError";

/** Thrown if a document can't validate. */
export class DocumentValidationError<T extends Data = Data> extends ValidationError {
	ref: ModelDocument<T>;
	constructor(ref: ModelDocument<T>, feedback: Feedback) {
		super(`Invalid data for "${ref.toString()}"`, feedback);
		this.ref = ref;
	}
}
DocumentValidationError.prototype.name = "DocumentValidationError";

/** Thrown if a query can't validate a set of results. */
export class QueryValidationError<T extends Data = Data> extends ValidationError {
	ref: ModelQuery<T>;
	constructor(ref: ModelQuery<T>, feedback: Feedback) {
		super(`Invalid documents for "${ref.collection}"`, feedback);
		this.ref = ref;
	}
}
QueryValidationError.prototype.name = "QueryValidationError";
