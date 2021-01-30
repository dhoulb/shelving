import type { ReadonlyObject, Change, Data, Result } from "shelving/tools";
import { ErrorDispatcher, logError, AsyncDispatcher, dispatch, UnsubscribeDispatcher } from "shelving/tools";
import { DataSchema, UnknownDataSchema, DataSchemas } from "shelving/schema";
import { DOCUMENT_PATH } from "./constants";
import { Reference, ReferenceRequiredError } from "./Reference";
import type { Provider } from "./Provider";
import { Collection } from "./Collection";

/** Options that modify a get operation. */
type DocumentGetOptions = {
	/** Throw a `RequiredError` if the document does not exist (defaults to `false`). */
	required?: boolean;
};

/** Options that modify a set operation. */
type DocumentSetOptions = {
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

const REQUIRED = { required: true };

/** Type of a document for a given Data schema. */
export type DocumentType<S extends UnknownDataSchema, P extends Provider = Provider> = S extends DataSchema<infer T, infer D, infer C>
	? Document<T, D, C, P>
	: never;

/**
 * Document reference: Allows document data to be read from or written to a provider.
 */
export class Document<
	T extends Data,
	D extends DataSchemas = DataSchemas,
	C extends DataSchemas = DataSchemas,
	P extends Provider = Provider
> extends Reference<T, D, C, P> {
	/** Path for document's collection. */
	readonly parent: string;

	/** String ID of the specific document in the collection. */
	readonly id: string;

	constructor(locus: DataSchema<T, D, C>, provider: P, parent: string, id: string) {
		super(locus, provider, `${parent}/${id}`);
		this.parent = parent;
		this.id = id;
	}

	/**
	 * Get a `Document` instance for a named subdocument of this document.
	 * @param name Document name, e.g. `options`
	 * @example `db.collection("dogs").doc("fido").doc("options").get()`
	 */
	doc<K extends keyof D>(name: K): Document<D[K]["DATA"], D[K]["documents"], D[K]["collections"], P> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return new Document(this.schema.documents[name], this.provider, `${this.path}/${DOCUMENT_PATH}`, name as string) as any;
	}

	/**
	 * Get a `Collection` instance for a named subcollection of this document.
	 * @param name Collection name, e.g. `puppies`
	 * @example `db.collection("dogs").doc("fido").collection("puppies").get()`
	 */
	collection<K extends keyof C>(name: K): Collection<C[K]["DATA"], C[K]["documents"], C[K]["collections"], P> {
		return new Collection(this.schema.collections[name], this.provider, `${this.path}/${name}`);
	}

	/**
	 * Get `Document` refs for all named subdocuments of this document.
	 * @returns Array of `Document` instances.
	 */
	get docs(): Document<D["string"]["DATA"], D[string]["documents"], D[string]["collections"], P>[] {
		return Object.keys(this.schema.documents).map(name => this.doc(name));
	}

	/**
	 * Get `Collection` refs for all named subcollections of this document.
	 * @returns Array of `Collection` instances.
	 */
	get collections(): Collection<D["string"]["DATA"], C[string]["documents"], C[string]["collections"], P>[] {
		return Object.keys(this.schema.collections).map(name => this.collection(name));
	}

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @returns Document's data, or `undefined` if it doesn't exist. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get(options: DocumentGetOptions & { required: true }): Promise<T>;
	get(options?: DocumentGetOptions): Promise<T>;
	async get(options?: DocumentGetOptions): Promise<Result<T>> {
		const result = await this.provider.getDocument(this);
		if (options?.required && !result) throw new ReferenceRequiredError(this);
		return result;
	}

	/**
	 * Does this document exist?
	 * @returns `true` if the document exists and `false` if it doesn't. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get exists(): Promise<boolean> {
		return this.get().then(Boolean);
	}

	/**
	 * Get the result of this document.
	 * - Shortcut for `document.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 */
	get result(): Promise<Result<T>> {
		return this.get();
	}

	/**
	 * Get the data of this document.
	 * - Handy for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 * - Shortcut for `document.get({ required: true })`
	 *
	 * @returns Document's data. Uses a `Promise` if the provider is async, or a non-promise otherwise.
	 * @throws RequiredError If the document's result was undefined.
	 */
	get data(): Promise<T> {
		return this.get(REQUIRED);
	}

	/**
	 * Subscribe to the data of this document.
	 * - Called immediately with the current result, and again any time the result changes.
	 *
	 * @param onNext Callback that is called when this document changes. Called with the document's data, or `undefined` if it doesn't exist.
	 * @param onError Callback that is called if an error occurs.
	 * @returns UnsubscribeDispatcher function that ends the subscription.
	 */
	on(onNext: AsyncDispatcher<Result<T>>, onError: ErrorDispatcher = logError): UnsubscribeDispatcher {
		return this.provider.onDocument(this, r => dispatch(onNext, r, onError), onError);
	}

	/**
	 * Set the entire data of this document.
	 * - The entire input data must be valid (or fixable) according to this collection's schema or error will be thrown.
	 * - Value is validated before being set. Can use `document.set(value, { validate: false })`
	 *
	 * @param data The (potentially invalid) input value.
	 * @returns The change that was made to the document (most likely the value that was passed in (after validation), unless this document's provider has different behaviour).
	 */
	set(change: Change<T>, options: DocumentSetOptions & { merge: true }): Promise<Change<T>>;
	set(data: ReadonlyObject, options: DocumentSetOptions & { validate: false }): Promise<Change<T>>;
	set(data: T, options?: DocumentSetOptions): Promise<Change<T>>;
	set(input: T, options?: DocumentSetOptions): Promise<Change<T>> {
		const data = !options?.validate ? input : options?.merge ? this.validateChange(input) : this.validate(input);
		return this.provider.mergeDocument(this, data);
	}

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
	merge(change: Change<T>): Promise<Change<T>> {
		return this.provider.mergeDocument(this, this.validateChange(change));
	}

	/**
	 * Delete an existing document.
	 * @returns The change that was made to the document (most likely `undefined`, unless this document's provider has different behaviour).
	 */
	delete(): Promise<void> {
		return this.provider.deleteDocument(this);
	}
}
