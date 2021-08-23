import { Data, Observable, Result, throwAsync, isAsync, Observer, Unsubscriber, AsyncDispatcher, AsyncCatcher, AsyncEmptyDispatcher } from "../util";
import type { Database } from "./Database";
import { DocumentState } from "./DocumentState";
import { ReferenceRequiredError } from "./errors";
import { Reference } from "./Reference";

/**
 * Document reference: allows reading from / writing to a specific document in a database.
 */
export class Document<T extends Data = Data> extends Reference<T> implements Observable<Result<T>> {
	readonly id: string;

	constructor(db: Database, collection: string, id: string) {
		super(db, collection, `${collection}/${id}`);
		this.id = id;
	}

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @return Document's data, or `undefined` if it doesn't exist.
	 */
	get(): Result<T> | Promise<Result<T>> {
		return this.db.provider.getDocument(this);
	}

	/**
	 * Does this document exist (synchronously).
	 *
	 * @return `true` if the document exists and `false` if it doesn't.
	 */
	get exists(): boolean {
		return throwAsync(this.asyncExists);
	}

	/**
	 * Does this document exist?
	 * @return `true` if the document exists and `false` if it doesn't.
	 */
	get asyncExists(): boolean | Promise<boolean> {
		const result = this.get();
		return isAsync(result) ? result.then(Boolean) : !!result;
	}

	/**
	 * Get value of this document (synchronously).
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist.
	 * @throws Promise if the value was not synchronous.
	 */
	get value(): Result<T> {
		return throwAsync(this.asyncValue);
	}

	/**
	 * Get the value of this document (asynchronously).
	 *
	 * @return Document's data, or `undefined` if the document doesn't exist (possibly promised).
	 */
	get asyncValue(): Result<T> | Promise<Result<T>> {
		return this.get();
	}

	/**
	 * Get the data of this document (asynchronously).
	 * - Useful for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 *
	 * @return Document's data.
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
	 * @return Document's data (possibly promised).
	 * @throws RequiredError if the document's result was undefined.
	 */
	get asyncData(): T | Promise<T> {
		const result = this.get();
		if (isAsync(result))
			return result.then(r => {
				if (!r) throw new ReferenceRequiredError(this);
				return r;
			});
		if (!result) throw new ReferenceRequiredError(this);
		return result;
	}

	/**
	 * Get the global document state for this document.
	 * - This state can be updated manually by calling `state.refresh()` on the returned `DocumentState`
	 * - Add a `StateProvider` to your database provider stack and `DocumentState` instances will be updated on all reads and writes.
	 *
	 * @return Unique global `State` instance specifying the current global state for this document.
	 */
	get state(): DocumentState<T> {
		return DocumentState.get(this);
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - `next()` is called once with the initial result, and again any time the result changes.
	 *
	 * @param observer Observer with `next`, `error`, or `complete` methods.
	 * @param next Callback that is called once initially and again whenever the result changes.
	 * @param error Callback that is called if an error occurs.
	 * @param complete Callback that is called when the subscription is done.
	 *
	 * @return Function that ends the subscription.
	 */
	subscribe(observer: Observer<Result<T>>): Unsubscriber;
	subscribe(next: AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(either: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber;
	subscribe(next: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return typeof next === "object" ? this.db.provider.onDocument<T>(this, next) : this.db.provider.onDocument(this, { next, error, complete });
	}

	/**
	 * Set the complete data of this document.
	 *
	 * @param data Complete data to set the document to.
	 *
	 * @return Nothing (possibly promised).
	 */
	set(data: T): void | Promise<void> {
		return this.db.provider.setDocument(this, data);
	}

	/**
	 * Update this document with partial data.
	 * - If the document exists, merge the partial data into it.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @param data Partial data to merge into the existing document.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	update(data: Partial<T>): void | Promise<void> {
		return this.db.provider.updateDocument(this, data);
	}

	/**
	 * Delete this document.
	 * - If the document doesn't exist, throw an error.
	 *
	 * @return Nothing (possibly promised).
	 * @throws Error If the document does not exist (ideally a `RequiredError` but may be provider-specific).
	 */
	delete(): void | Promise<void> {
		return this.db.provider.deleteDocument(this);
	}
}
