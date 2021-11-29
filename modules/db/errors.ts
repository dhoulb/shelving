import type { Datas, Key } from "../util/index.js";
import { RequiredError, ValidationError } from "../error/index.js";
import { Feedback } from "../feedback/index.js";
import type { DatabaseDocument, DatabaseQuery } from "./Database.js";

/** Thrown if a document doesn't exist. */
export class DocumentRequiredError<D extends Datas, C extends Key<D>> extends RequiredError {
	ref: DatabaseDocument<C, D>;
	constructor(ref: DatabaseDocument<C, D>) {
		super(`Document "${ref.toString()}" does not exist`);
		this.ref = ref;
	}
}
DocumentRequiredError.prototype.name = "DocumentRequiredError";

/** Thrown if a document can't validate. */
export class DocumentValidationError<D extends Datas, C extends Key<D>> extends ValidationError {
	ref: DatabaseDocument<C, D>;
	constructor(ref: DatabaseDocument<C, D>, feedback: Feedback) {
		super(`Invalid data for "${ref.toString()}"`, feedback);
		this.ref = ref;
	}
}
DocumentValidationError.prototype.name = "DocumentValidationError";

/** Thrown if a query can't validate a set of results. */
export class QueryValidationError<D extends Datas, C extends Key<D>> extends ValidationError {
	ref: DatabaseQuery<C, D>;
	constructor(ref: DatabaseQuery<C, D>, feedback: Feedback) {
		super(`Invalid documents for "${ref.collection}"`, feedback);
		this.ref = ref;
	}
}
QueryValidationError.prototype.name = "QueryValidationError";
