import { TransformableObserver, Observer } from "../util/observe.js";
import { Data, Result, isData } from "../util/data.js";
import { getFirstItem } from "../util/array.js";
import type { Entries } from "../util/entry.js";
import type { DocumentReference, QueryReference, Reference } from "./Reference.js";
import { DocumentRequiredError, QueryRequiredError } from "./errors.js";

/** Database data embeds the corresponding `Document` instance and string ID into the data. */
export type DocumentData<T extends Data> = T & { id: string; doc: DocumentReference<T> };

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(result: DocumentResult<T> | Result<T>, ref: DocumentReference<T>): DocumentData<T> {
	if (result) return isDocumentData<T>(result) ? result : { ...result, id: ref.id, doc: ref };
	throw new DocumentRequiredError(ref);
}

/** Is an unknown value a DocumentResult. */
export const isDocumentData = <T extends Data>(v: DocumentData<T> | unknown): v is DocumentData<T> => isData(v) && "id" in v && "doc" in v;

/** Oserver that transforms a result into a document result. */
export class DocumentDataObserver<T extends Data> extends TransformableObserver<Result<T>, DocumentData<T>> {
	protected _ref: DocumentReference<T>;
	constructor(target: Observer<DocumentData<T>>, ref: DocumentReference<T>) {
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
export function getDocumentResult<T extends Data>(result: Result<T>, ref: DocumentReference<T>): DocumentResult<T> {
	return result ? getDocumentData(result, ref) : null;
}

/** Is an unknown value a DocumentResult. */
export const isDocumentResult = <T extends Data>(v: DocumentResult<T> | Result<T> | unknown): v is DocumentResult<T> => isData(v) && "id" in v && "doc" in v;

/** Oserver that transforms a set of entries into a results map. */
export class DocumentResultObserver<T extends Data> extends TransformableObserver<Result<T>, DocumentResult<T>> {
	protected _ref: DocumentReference<T>;
	constructor(target: Observer<DocumentResult<T>>, ref: DocumentReference<T>) {
		super(target);
		this._ref = ref;
	}
	transform(result: Result<T>): DocumentResult<T> {
		return getDocumentResult(result, this._ref);
	}
}

/** Get the data for a document from a result for that document. */
export function getQueryData<T extends Data>(entries: Entries<T>, ref: QueryReference<T>): DocumentData<T> {
	const data = getQueryResult(entries, ref);
	if (data) return data;
	throw new QueryRequiredError(ref);
}

/** Get the data for a document from a result for that document. */
export function getQueryResult<T extends Data>(entries: Entries<T>, ref: QueryReference<T>): DocumentResult<T> {
	const first = getFirstItem(entries);
	if (first) return getDocumentData(first[1], ref.doc(first[0]));
	return null;
}

/** Are two database references equal? */
export const isSameReference = (left: Reference, right: Reference): boolean => left === right || left.toString() === right.toString();
