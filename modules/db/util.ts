import type { Entity, OptionalEntity, Data, Entities } from "../util/data.js";
import { getFirstItem, getLastItem } from "../util/array.js";
import type { DocumentReference, QueryReference, Reference } from "./Reference.js";
import { ReferenceRequiredError } from "./errors.js";

/** Get the data for a document from a result for that document. */
export function getDocumentData<T extends Data>(entity: OptionalEntity<T>, ref: DocumentReference<T>): Entity<T> {
	if (entity) return entity;
	throw new ReferenceRequiredError(ref);
}

/** Get the data for a document from a set of queried entities. */
export function getQueryFirstData<T extends Data>(entities: Entities<T>, ref: QueryReference<T>): Entity<T> {
	const entity = getQueryFirstValue(entities);
	if (entity) return entity;
	throw new ReferenceRequiredError(ref);
}

/** Get the data for a document from a set of queried entities. */
export function getQueryLastData<T extends Data>(entities: Entities<T>, ref: QueryReference<T>): Entity<T> {
	const entity = getQueryLastValue(entities);
	if (entity) return entity;
	throw new ReferenceRequiredError(ref);
}

/** Get the optional data for a document from a set of queried entities. */
export function getQueryFirstValue<T extends Data>(entities: Entities<T>): OptionalEntity<T> {
	return getFirstItem(entities) || null;
}

/** Get the optional data for a document from a set of queried entities. */
export function getQueryLastValue<T extends Data>(entities: Entities<T>): OptionalEntity<T> {
	return getLastItem(entities) || null;
}

/** Are two database references equal? */
export const isSameReference = (left: Reference, right: Reference): boolean => left === right || left.toString() === right.toString();
