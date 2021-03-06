import { Data, Result, AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher, Unsubscriber, Observer, Observable, isAsync, throwAsync } from "../util";
import { Validator } from "../schema";
import type { Provider } from "./Provider";
import type { Reference } from "./Reference";
import { DocumentRequiredError } from "./errors";

/**
 * Document reference: allows reading from / writing to a specific document in a database.
 */
export class Document<T extends Data = Data> implements Reference<T>, Observable<Result<T>> {
	readonly provider: Provider;
	readonly schema: Validator<T>;
	readonly path: string;
	readonly collection: string;
	readonly id: string;

	protected constructor(schema: Validator<T>, provider: Provider, collection: string, id: string) {
		this.provider = provider;
		this.schema = schema;
		this.collection = collection;
		this.id = id;
		this.path = `${collection}/${id}`;
	}

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @returns Document's data, or `undefined` if it doesn't exist.
	 */
	get(): Result<T> | Promise<Result<T>> {
		return this.provider.getDocument(this);
	}

	/**
	 * Does this document exist (synchronously).
	 * @returns `true` if the document exists and `false` if it doesn't.
	 */
	get exists(): boolean {
		return throwAsync(this.asyncExists);
	}

	/**
	 * Does this document exist?
	 * @returns `true` if the document exists and `false` if it doesn't.
	 */
	get asyncExists(): boolean | Promise<boolean> {
		const result = this.get();
		return isAsync(result) ? result.then(Boolean) : !!result;
	}

	/**
	 * Get value of this document (synchronously).
	 * @returns Document's data, or `undefined` if the document doesn't exist.
	 * @throws Promise if the value was not synchronous.
	 */
	get value(): Result<T> {
		return throwAsync(this.asyncValue);
	}

	/**
	 * Get the value of this document (asynchronously).
	 * @returns Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get asyncValue(): Result<T> | Promise<Result<T>> {
		return this.get();
	}

	/**
	 * Get the data of this document (asynchronously).
	 * - Useful for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 *
	 * @returns Document's data.
	 * @throws Promise if the data was not synchronous.
	 * @throws RequiredError if the document's result was undefined.
	 */
	get data(): T {
		return throwAsync(this.asyncData);
	}

	/**
	 * Get the data of this document (asynchronously).
	 * - Useful for destructuring, e.g. `{ name, title } = await documentThatMustExist.asyncData`
	 *
	 * @returns Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get asyncData(): T | Promise<T> {
		const result = this.get();
		if (isAsync(result))
			return result.then(r => {
				if (!r) throw new DocumentRequiredError(this);
				return r;
			});
		if (!result) throw new DocumentRequiredError(this);
		return result;
	}

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
	subscribe(next: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return typeof next === "object" ? this.provider.onDocument(this, next) : this.provider.onDocument(this, { next, error, complete });
	}

	/**
	 * Set the entire data of this document.
	 * - The entire input data must be valid (or fixable) according to this collection's schema or error will be thrown.
	 *
	 * @param data The (potentially invalid) data to apply to the document.
	 * @param options.required Throw an error if the document does not exist (defaults to `false`)
	 *
	 * @return Promise that resolves when done.
	 */
	set(data: T): void | Promise<void> {
		return this.provider.setDocument(this, data);
	}

	/**
	 * Update an existing document by merging in a partial new value.
	 * - Requires only a partial value (any missing properties are ignored).
	 * - Props specified in the input value must be valid according to this collection's schema or error will be thrown.
	 * - Props missing from the input value cause no errors.
	 * - Document must exist or an error will be thrown.
	 *
	 * @param partial The (potentially invalid) partial data to apply to the document.
	 * @param options.required Throw an error if the document does not exist (defaults to `true`)
	 *
	 * @return Promise that resolves when done.
	 */
	update(partial: Partial<T>): void | Promise<void> {
		return this.provider.updateDocument(this, partial);
	}

	/**
	 * Delete an existing document.
	 *
	 * @return Promise that resolves when done.
	 */
	async delete(): Promise<void> {
		await this.provider.deleteDocument(this);
	}

	// Implement toString()
	toString(): string {
		return this.path;
	}
}
