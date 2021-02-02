import type { ImmutableObject } from "../object";
import type { Data, Change, Result } from "../data";
import type { DataSchemas, AnyDataSchema } from "../schema";
import type { AsyncDispatcher, ErrorDispatcher, UnsubscribeDispatcher } from "../dispatch";
import type { Collection } from "./Collection";
import type { Reference } from "./Reference";

/** A generic document whose generics are not known. */
export type AnyDocument = Document<Data, DataSchemas, DataSchemas>;

/** Options that modify a get operation. */
export type DocumentGetOptions = {
	/** Throw a `RequiredError` if the document does not exist (defaults to `false`). */
	required?: boolean;
};

/** Options that modify a set operation. */
export type DocumentSetOptions = {
	/**
	 * Whether to apply validation to the input value (defaults to `true`).
	 * - Warning: This allow **ANY** data to be directly set to the database.
	 */
	validate?: boolean;
	/**
	 * Whether the input value is partial and should be merged in, or not (defaults to `false`).
	 * - Partial input values are merged into the existing value.
	 */
	merge?: boolean;
};

/** Get Document type for a given DataSchema. */
export type DataDocument<S extends AnyDataSchema> = Document<S["DATA"], S["documents"], S["collections"]>;

/** Type for a document instance. */
export interface Document<T extends Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas> extends Reference<T> {
	/** Path for document's collection. */
	readonly parent: string;

	/** String ID of the specific document in the collection. */
	readonly id: string;

	/**
	 * Get a `Document` instance for a named subdocument of this reference.
	 * @param name Document name, e.g. `options`
	 * @example `db.collection("dogs").doc("fido").doc("options").get()`
	 */
	doc<K extends keyof D>(name: K): Document<D[K]["DATA"], D[K]["documents"], D[K]["collections"]>;

	/**
	 * Get a `Collection` instance for a named subcollection of this reference.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.collection("dogs").doc("fido").collection("puppies").get()`
	 */
	collection<K extends keyof C>(name: K): Collection<C[K]["DATA"], C[K]["documents"], C[K]["collections"]>;

	/**
	 * Get `Document` refs for all named subdocuments of this document.
	 * @returns Array of `Document` instances.
	 */
	readonly docs: Document<D[string]["DATA"], D[string]["documents"], D[string]["collections"]>[];

	/**
	 * Get `Collection` refs for all named subcollections of this document.
	 * @returns Array of `Collection` instances.
	 */
	readonly collections: Collection<D[string]["DATA"], C[string]["documents"], C[string]["collections"]>[];

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @returns Document's data, or `undefined` if it doesn't exist. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get(options: DocumentGetOptions & { required: true }): Promise<T>;
	get(options?: DocumentGetOptions): Promise<T>;

	/**
	 * Does this document exist?
	 * @returns `true` if the document exists and `false` if it doesn't. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	readonly exists: Promise<boolean>;

	/**
	 * Get the result of this document.
	 * - Shortcut for `document.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	readonly result: Promise<Result<T>>;

	/**
	 * Get the data of this document.
	 * - Handy for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 * - Shortcut for `document.get({ required: true })`
	 *
	 * @returns Document's data. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 * @throws RequiredError If the document's result was undefined.
	 */
	readonly data: Promise<T>;

	/**
	 * Subscribe to the data of this document.
	 * - Called immediately with the current result, and again any time the result changes.
	 *
	 * @param onNext Callback that is called when this document changes. Called with the document's data, or `undefined` if it doesn't exist.
	 * @param onError Callback that is called if an error occurs.
	 * @returns UnsubscribeDispatcher function that ends the subscription.
	 */
	on(onNext: AsyncDispatcher<Result<T>>, onError?: ErrorDispatcher): UnsubscribeDispatcher;

	/**
	 * Set the entire data of this document.
	 * - The entire input data must be valid (or fixable) according to this collection's schema or error will be thrown.
	 * - Value is validated before being set. Can use `document.set(value, { validate: false })`
	 *
	 * @param data The (potentially invalid) input value.
	 * @returns The change that was made to the document (most likely the value that was passed in (after validation), unless this document's provider has different behaviour).
	 */
	set(change: Change<T>, options: DocumentSetOptions & { merge: true }): Promise<Change<T>>;
	set(data: ImmutableObject, options: DocumentSetOptions & { validate: false }): Promise<Change<T>>;
	set(data: T, options?: DocumentSetOptions): Promise<Change<T>>;

	/**
	 * Merge a partial value into an existing document.
	 * - Equivalent to `document.set(value, { merge: true })`
	 * - Requires only a partial value (any missing properties are ignored).
	 * - Props specified in the input value must be valid according to this collection's schema or error will be thrown.
	 * - Props missing from the input value cause no errors.
	 *
	 * @param change The (potentially invalid) partial input value.
	 * @returns The change that was made to the document (most likely the value that was passed in (after validation), unless this document's provider has different behaviour).
	 */
	merge(change: Change<T>): Promise<Change<T>>;

	/**
	 * Delete an existing document.
	 * @returns The change that was made to the document (most likely `undefined`, unless this document's provider has different behaviour).
	 */
	delete(): Promise<void>;
}