import type { ImmutableObject } from "../object";
import type { Data, Result } from "../data";
import type { DataSchemas, DataSchema, Validator } from "../schema";
import type { AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher, Unsubscriber } from "../function";
import type { Observer, Subscribable } from "../observe";
import type { Collection } from "./Collection";
import type { DeleteOptions, GetOptions, SetOptions } from "./options";

/** Get a `Document` for a given `DataSchema`. */
export type SchemaDocument<S extends DataSchema> = Document<S["type"], S["documents"], S["collections"]>;

/** Type for a document instance. */
export interface Document<T extends Data = Data, D extends DataSchemas = DataSchemas, C extends DataSchemas = DataSchemas>
	extends Validator<T>,
		Subscribable<Result<T>> {
	/** Data schema that validates this document. */
	readonly schema: DataSchema<T, D, C>;

	/** Full path to the data (e.g. `dogs/fido`) */
	readonly path: string;

	/** Path for document's collection. */
	readonly parent: string;

	/** String ID of the specific document in the collection. */
	readonly id: string;

	/**
	 * Get a `Document` instance for a named subdocument of this reference.
	 * @param name Document name, e.g. `options`
	 * @example `db.collection("dogs").doc("fido").doc("options").get()`
	 */
	doc<K extends keyof D>(name: K): Document<D[K]["type"], D[K]["documents"], D[K]["collections"]>;

	/**
	 * Get a `Collection` instance for a named subcollection of this reference.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.collection("dogs").doc("fido").collection("puppies").get()`
	 */
	collection<K extends keyof C>(name: K): Collection<C[K]["type"], C[K]["documents"], C[K]["collections"]>;

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @returns Document's data, or `undefined` if it doesn't exist. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	get(options: GetOptions & { required: true }): Promise<T>;
	get(options?: GetOptions): Promise<T>;

	/**
	 * Does this document exist?
	 * @returns `true` if the document exists and `false` if it doesn't. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	readonly exists: Promise<boolean>;

	/**
	 * Get the result of this document.
	 * - Shortcut for `document.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a promise if the provider is async, or a non-promise otherwise.
	 */
	readonly result: Promise<Result<T>>;

	/**
	 * Get the data of this document.
	 * - Handy for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 * - Shortcut for `document.get({ required: true })`
	 *
	 * @returns Document's data. Uses a promise if the provider is async, or a non-promise otherwise.
	 * @throws RequiredError If the document's result was undefined.
	 */
	readonly data: Promise<T>;

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - Called immediately with the first result, and again any time the results change.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods.
	 * @param next Callback that is called when this document changes. Called with the document's data, or `undefined` if it doesn't exist.
	 * @param error Callback that is called if an error occurs.
	 * @param complete Callback that is called when the subscription is done.
	 *
	 * @returns Function that ends the subscription.
	 */
	subscribe(observer: Observer<Result<T>>): Unsubscriber;
	subscribe(next: AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;

	/**
	 * Set the entire data of this document.
	 * - The entire input data must be valid (or fixable) according to this collection's schema or error will be thrown.
	 * - Data is validated before being set. Can use `document.set(value, { validate: false })` to skip validation.
	 *
	 * @param data The (potentially invalid) input value.
	 * @returns The change that was made to the document (most likely the value that was passed in (after validation), unless this document's provider has different behaviour).
	 */
	set(unsafeData: ImmutableObject, options: SetOptions & { validate: false }): Promise<void>;
	set(data: T, options?: SetOptions): Promise<void>;

	/**
	 * Update an existing document by merging in a partial new value.
	 * - Requires only a partial value (any missing properties are ignored).
	 * - Props specified in the input value must be valid according to this collection's schema or error will be thrown.
	 * - Props missing from the input value cause no errors.
	 * - Partial data is validated before being updated. Can use `document.set(value, { validate: false })` to skip validation.
	 * - Document must exist or an error will be thrown.
	 *
	 * @param change The (potentially invalid) partial input value.
	 * @returns The change that was made to the document (most likely the value that was passed in (after validation), unless this document's provider has different behaviour).
	 */
	update(unsafePartial: ImmutableObject, options?: SetOptions & { validate: false }): Promise<void>;
	update(partial: Partial<T>, options?: SetOptions): Promise<void>;

	/**
	 * Delete an existing document.
	 * @returns The change that was made to the document (most likely `undefined`, unless this document's provider has different behaviour).
	 */
	delete(options?: DeleteOptions): Promise<void>;

	// Must implement toString()
	toString(): string;
}
