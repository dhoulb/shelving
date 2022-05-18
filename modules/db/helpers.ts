import { Data, Result, TransformerObserver, Observer, isData, Entries, getFirstItem } from "../util/index.js";
import type { DatabaseDocument, DatabaseQuery } from "./Database.js";
import { DocumentRequiredError, QueryRequiredError } from "./errors.js";

/** Database data embeds the corresponding `Document` instance and string ID into the data. */
export type DocumentData<T extends Data> = T & { id: string; doc: DatabaseDocument<T> };

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(result: DocumentResult<T> | Result<T>, ref: DatabaseDocument<T>): DocumentData<T> {
	if (result) return isDocumentData<T>(result) ? result : { ...result, id: ref.id, doc: ref };
	throw new DocumentRequiredError(ref);
}

/** Is an unknown value a DocumentResult. */
export const isDocumentData = <T extends Data>(v: DocumentData<T> | unknown): v is DocumentData<T> => isData(v) && "id" in v && "doc" in v;

/** Oserver that transforms a result into a document result. */
export class DocumentDataObserver<T extends Data> extends TransformerObserver<Result<T>, DocumentData<T>> {
	protected _ref: DatabaseDocument<T>;
	constructor(ref: DatabaseDocument<T>, target: Observer<DocumentData<T>>) {
		super(target);
		this._ref = ref;
	}
	transform(result: Result<T>): DocumentData<T> {
		return getDocumentData(result, this._ref);
	}
}

/** Database result embeds the corresponding `Document` instance and string ID into the result. */
export type DocumentResult<T extends Data> = DocumentData<T> | null;

/** Get the data for a document from a result for that document. */
export function getDocumentResult<T extends Data>(result: Result<T>, ref: DatabaseDocument<T>): DocumentResult<T> {
	return result ? getDocumentData(result, ref) : null;
}

/** Is an unknown value a DocumentResult. */
export const isDocumentResult = <T extends Data>(v: DocumentResult<T> | Result<T> | unknown): v is DocumentResult<T> => isData(v) && "id" in v && "doc" in v;

/** Oserver that transforms a set of entries into a results map. */
export class DocumentResultObserver<T extends Data> extends TransformerObserver<Result<T>, DocumentResult<T>> {
	protected _ref: DatabaseDocument<T>;
	constructor(ref: DatabaseDocument<T>, target: Observer<DocumentResult<T>>) {
		super(target);
		this._ref = ref;
	}
	transform(result: Result<T>): DocumentResult<T> {
		return getDocumentResult(result, this._ref);
	}
}

/** Get the data for a document from a result for that document. */
export function getQueryData<T extends Data>(entries: Entries<T>, ref: DatabaseQuery<T>): DocumentData<T> {
	const data = getQueryResult(entries, ref);
	if (data) return data;
	throw new QueryRequiredError(ref);
}

/** Get the data for a document from a result for that document. */
export function getQueryResult<T extends Data>(entries: Entries<T>, ref: DatabaseQuery<T>): DocumentResult<T> {
	const first = getFirstItem(entries);
	if (first) return getDocumentData(first[1], ref.doc(first[0]));
	return null;
}
