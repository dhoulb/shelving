import type { Entity } from "../util/data.js";
import { Data, Result } from "../util/data.js";
import { getFirstItem } from "../util/array.js";
import type { DocumentReference, QueryReference, Reference } from "./Reference.js";
import { ReferenceRequiredError } from "./errors.js";

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(result: Result<Entity<T>>, ref: DocumentReference<T>): Entity<T> {
	if (result) return result;
	throw new ReferenceRequiredError(ref);
}

/** Get the data for a document from a result for that document. */
export function getQueryData<T extends Data>(entities: Iterable<Entity<T>>, ref: QueryReference<T>): Entity<T> {
	const entity = getQueryResult(entities);
	if (entity) return entity;
	throw new ReferenceRequiredError(ref);
}

/** Get the data for a document from a result for that document. */
export function getQueryResult<T extends Data>(entities: Iterable<Entity<T>>): Entity<T> | null {
	return getFirstItem(entities) || null;
}

/** Are two database references equal? */
export const isSameReference = (left: Reference, right: Reference): boolean => left === right || left.toString() === right.toString();
