import type { ImmutableObject } from "../object";
import type { Data, Result } from "../data";
import type { Validator } from "../schema";
import type { AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher, Unsubscriber } from "../function";
import type { Observer, Subscribable } from "../observe";
import { Stream } from "../stream";
import { RequiredError } from "../errors";
import type { DatabaseReadOptions, DatabaseWriteOptions } from "./options";
import type { Provider } from "./Provider";
import { Reference } from "./Reference";
import { DocumentRequiredError } from "./errors";

const OPTIONS = {};
const REQUIRED = { required: true } as const;
const PARTIAL = { partial: true } as const;

/** Type for a document instance. */
export class Document<T extends Data = Data> extends Reference<T> implements Validator<T>, Subscribable<Result<T>> {
	/** Path for document's collection. */
	readonly collection: string;

	/** String ID of the specific document in the collection. */
	readonly id: string;

	protected constructor(schema: Validator<T>, provider: Provider, collection: string, id: string) {
		super(schema, provider, `${collection}/${id}`);
		this.collection = collection;
		this.id = id;
	}

	/**
	 * Get the result of this document.
	 * - Alternate syntax for `this.result`
	 * - If `options.required = true` then throws `ReferenceRequiredError` if the document doesn't exist.
	 *
	 * @returns Document's data, or `undefined` if it doesn't exist.
	 */
	async get(options: DatabaseReadOptions & { required: true; validate: false }): Promise<Data>;
	async get(options: DatabaseReadOptions & { validate: false }): Promise<Result>;
	async get(options: DatabaseReadOptions & { required: true }): Promise<T>;
	async get(options?: DatabaseReadOptions): Promise<Result<T>>;
	async get({ validate = this.provider.VALIDATE, required = false }: DatabaseReadOptions = OPTIONS): Promise<Result> {
		const result = await this.provider.getDocument(this);
		if (result) return validate === false ? result : this.validate(result);
		if (required) throw new DocumentRequiredError(this);
		return undefined;
	}

	/**
	 * Does this document exist?
	 * @returns `true` if the document exists and `false` if it doesn't.
	 */
	get exists(): Promise<boolean> {
		return this.get().then(Boolean);
	}

	/**
	 * Get the result of this document.
	 * - Shortcut for `document.get()`
	 *
	 * @returns Document's data, or `undefined` if the document doesn't exist.
	 */
	get result(): Promise<Result<T>> {
		return this.get();
	}

	/**
	 * Get the data of this document.
	 * - Handy for destructuring, e.g. `{ name, title } = documentThatMustExist.data`
	 * - Shortcut for `document.get({ required: true })`
	 *
	 * @returns Document's data.
	 * @throws RequiredError If the document's result was undefined.
	 */
	get data(): Promise<T> {
		return this.get(REQUIRED);
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
		return typeof next === "object" ? this.on(next) : this.on({ next, error, complete });
	}

	/**
	 * Subscribe to the result of this document (indefinitely).
	 * - Like `subscribe()` but first argument must be an observer and a `DatabaseGetOptions` can be set as the second argument.
	 */
	on(observer: Observer<Result>, options: DatabaseReadOptions & { validate: false }): Unsubscriber;
	on(observer: Observer<Result<T>>, options?: DatabaseReadOptions): Unsubscriber;
	on(observer: Observer<Result>, { validate = this.provider.VALIDATE }: DatabaseReadOptions = OPTIONS): Unsubscriber {
		const stream = Stream.create<Result>();
		if (validate === false) stream.on(observer);
		else stream.derive(v => (v ? this.validate(v) : undefined)).on(observer);
		return this.provider.onDocument(this, stream);
	}

	/**
	 * Set the entire data of this document.
	 * - The entire input data must be valid (or fixable) according to this collection's schema or error will be thrown.
	 * - Data is validated before being set. Can use `document.set(value, { validate: false })` to skip validation.
	 *
	 * @param data The (potentially invalid) data to apply to the document.
	 * @param options.validate Whether the data is validated (defaults to `true`)
	 * @param options.required Throw an error if the document does not exist (defaults to `false`)
	 *
	 * @return Promise that resolves when done.
	 */
	async set(unsafeData: ImmutableObject, options: DatabaseWriteOptions & { validate: false }): Promise<void>;
	async set(data: T, options?: DatabaseWriteOptions): Promise<void>;
	async set(unvalidatedData: ImmutableObject, { validate = true, required = false }: DatabaseWriteOptions = OPTIONS): Promise<void> {
		const data = validate === false ? (unvalidatedData as Data) : this.validate(unvalidatedData);
		if (required) await this.provider.updateDocument(this, data);
		else await this.provider.setDocument(this, data);
	}

	/**
	 * Update an existing document by merging in a partial new value.
	 * - Requires only a partial value (any missing properties are ignored).
	 * - Props specified in the input value must be valid according to this collection's schema or error will be thrown.
	 * - Props missing from the input value cause no errors.
	 * - Partial data is validated before being updated. Can use `document.set(value, { validate: false })` to skip validation.
	 * - Document must exist or an error will be thrown.
	 *
	 * @param partial The (potentially invalid) partial data to apply to the document.
	 * @param options.validate Whether the partial data is validated (defaults to `true`)
	 * @param options.required Throw an error if the document does not exist (defaults to `true`)
	 *
	 * @return Promise that resolves when done.
	 */
	async update(unsafePartial: ImmutableObject, options?: DatabaseWriteOptions & { validate: false }): Promise<void>;
	async update(partial: Partial<T>, options?: DatabaseWriteOptions): Promise<void>;
	async update(unvalidatedPartial: ImmutableObject, { validate = true, required = true }: DatabaseWriteOptions = OPTIONS): Promise<void> {
		const partial = validate === false ? (unvalidatedPartial as Data) : this.validate(unvalidatedPartial, PARTIAL);
		try {
			await this.provider.updateDocument(this, partial);
		} catch (thrown) {
			if (!(thrown instanceof RequiredError) || required !== false) throw thrown;
		}
	}

	/**
	 * Delete an existing document.
	 *
	 * @return Promise that resolves when done.
	 */
	async delete(): Promise<void> {
		await this.provider.deleteDocument(this);
	}
}
