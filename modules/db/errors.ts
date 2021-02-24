import { RequiredError } from "../errors";
import type { Document } from "./Document";

/** Error thrown when a document doesn't exist. */
export class DocumentRequiredError extends RequiredError {
	document: Document;
	constructor(document: Document) {
		super(`Path does not exist: "${document.path}"`);
		this.document = document;
	}
}
