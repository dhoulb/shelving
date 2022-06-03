import type { Data } from "../util/data.js";
import { RequiredError } from "../error/RequiredError.js";
import type { DocumentReference, QueryReference } from "./Reference.js";

/** Thrown if a document doesn't exist. */
export class DocumentRequiredError<T extends Data> extends RequiredError {
	ref: DocumentReference<T>;
	constructor(ref: DocumentReference<T>) {
		super(`Document ${ref.toString()} does not exist`);
		this.ref = ref;
	}
}
DocumentRequiredError.prototype.name = "DocumentRequiredError";

/** Thrown if a query doesn't exist. */
export class QueryRequiredError<T extends Data> extends RequiredError {
	ref: QueryReference<T>;
	constructor(ref: QueryReference<T>) {
		super(`Query ${ref.toString()} has no results`);
		this.ref = ref;
	}
}
QueryRequiredError.prototype.name = "QueryRequiredError";
