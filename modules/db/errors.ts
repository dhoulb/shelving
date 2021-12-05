import type { Data } from "../util/index.js";
import { RequiredError, ValidationError } from "../error/index.js";
import type { Feedback } from "../feedback/index.js";
import type { DataDocument, DataQuery } from "./Database.js";

/** Thrown if a document doesn't exist. */
export class DocumentRequiredError<T extends Data> extends RequiredError {
	ref: DataDocument<T>;
	constructor(ref: DataDocument<T>) {
		super(`Document "${ref.toString()}" does not exist`);
		this.ref = ref;
	}
}
DocumentRequiredError.prototype.name = "DocumentRequiredError";

/** Thrown if a document can't validate. */
export class DocumentValidationError<T extends Data> extends ValidationError {
	ref: DataDocument<T>;
	constructor(ref: DataDocument<T>, feedback: Feedback) {
		super(`Invalid data for "${ref.toString()}"`, feedback);
		this.ref = ref;
	}
}
DocumentValidationError.prototype.name = "DocumentValidationError";

/** Thrown if a query can't validate a set of results. */
export class QueryValidationError<T extends Data> extends ValidationError {
	ref: DataQuery<T>;
	constructor(ref: DataQuery<T>, feedback: Feedback) {
		super(`Invalid documents for "${ref.collection}"`, feedback);
		this.ref = ref;
	}
}
QueryValidationError.prototype.name = "QueryValidationError";
