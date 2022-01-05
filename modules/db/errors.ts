import type { Data } from "../util/index.js";
import { RequiredError, ValidationError } from "../error/index.js";
import type { Feedback } from "../feedback/index.js";
import type { DatabaseDocument, DatabaseQuery } from "./Database.js";

/** Thrown if a document doesn't exist. */
export class DocumentRequiredError<T extends Data> extends RequiredError {
	ref: DatabaseDocument<T>;
	constructor(ref: DatabaseDocument<T>) {
		super(`Document "${ref.toString()}" does not exist`);
		this.ref = ref;
	}
}
DocumentRequiredError.prototype.name = "DocumentRequiredError";

/** Thrown if a query doesn't exist. */
export class QueryRequiredError<T extends Data> extends RequiredError {
	ref: DatabaseQuery<T>;
	constructor(ref: DatabaseQuery<T>) {
		super(`Query "${ref.toString()}" has no results`);
		this.ref = ref;
	}
}
QueryRequiredError.prototype.name = "QueryRequiredError";

/** Thrown if a document can't validate. */
export class DocumentValidationError<T extends Data> extends ValidationError {
	ref: DatabaseDocument<T>;
	constructor(ref: DatabaseDocument<T>, feedback: Feedback) {
		super(`Invalid data for "${ref.toString()}"`, feedback);
		this.ref = ref;
	}
}
DocumentValidationError.prototype.name = "DocumentValidationError";

/** Thrown if a query can't validate a set of results. */
export class QueryValidationError<T extends Data> extends ValidationError {
	ref: DatabaseQuery<T>;
	constructor(ref: DatabaseQuery<T>, feedback: Feedback) {
		super(`Invalid documents for "${ref.collection}"`, feedback);
		this.ref = ref;
	}
}
QueryValidationError.prototype.name = "QueryValidationError";
