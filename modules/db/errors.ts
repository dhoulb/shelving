import type { Data } from "../util";
import { RequiredError } from "../errors";
import type { Document } from "./Document";

/** Thrown if a document doesn't exist. */
export class DocumentRequiredError<T extends Data = Data> extends RequiredError {
	document: Document<T>;
	constructor(document: Document<T>) {
		super(`Path does not exist: "${document.path}"`);
		this.document = document;
	}
}
