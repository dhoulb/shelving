import { RequiredError } from "../errors";
import type { AnyDocument } from "./Document";

/** Error thrown when a document doesn't exist. */
export class DocumentRequiredError extends RequiredError {
	document: AnyDocument;
	constructor(document: AnyDocument) {
		super(`Path does not exist: "${document.path}"`);
		this.document = document;
	}
}
