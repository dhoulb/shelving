import type { AsyncDispatcher, AsyncEmptyDispatcher, AsyncCatcher, Unsubscriber } from "../function";
import type { Entry } from "../entry";
import type { ArrayType, ImmutableArray } from "../array";
import type { Observer } from "../observe";
import { EmptyObject, getFirstProp, getLastProp, ImmutableObject, MutableObject } from "../object";
import { DataSchemas, DataSchema, Validator, ValidateOptions, PARTIAL } from "../schema";
import { Data, Result, Results } from "../data";
import { InvalidFeedback, isFeedback } from "../feedback";
import { Query } from "../query";
import { RequiredError, ValidationError } from "../errors";
import { Stream } from "../stream";
import { cacheMethod } from "../class";
import type { Provider } from "./Provider";
import type { Database as DatabaseInterface } from "./Database";
import type { Collection as CollectionInterface } from "./Collection";
import type { Document as DocumentInterface } from "./Document";
import { DOCUMENT_PATH } from "./constants";
import { DocumentRequiredError } from "./errors";
import { GetOptions, DeleteOptions, SetOptions } from "./options";

const GET_REQUIRED = { required: true } as const;
const SET_UNVALIDATED = { validate: false } as const;
const DELETE_DEEP = { deep: true } as const;

const dontThrowRequiredError = (thrown: RequiredError | unknown): void => {
	if (!(thrown instanceof RequiredError)) throw thrown;
};

/** Options when creating a database instance. */
type DatabaseCreateOptions<D extends DataSchemas, C extends DataSchemas> = {
	documents?: D;
	collections?: C;
	provider: Provider;
};

/** Create a new Database instance. */
export const createDatabase = <D extends DataSchemas = EmptyObject, C extends DataSchemas = EmptyObject>({
	documents,
	collections,
	provider,
}: DatabaseCreateOptions<D, C>): DatabaseInterface<D, C> => new Database<D, C>(documents || ({} as D), collections || ({} as C), provider);

// Implement Database.
class Database<D extends DataSchemas, C extends DataSchemas> implements DatabaseInterface<D, C> {
	protected readonly _provider: Provider;
	readonly documents: D;
	readonly collections: C;
	constructor(documents: D, collections: C, provider: Provider) {
		this.documents = documents;
		this.collections = collections;
		this._provider = provider;
	}
	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["TYPE"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["TYPE"], D[K]["documents"], D[K]["collections"]>(this.documents[name], this._provider, DOCUMENT_PATH, name as string);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["TYPE"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["TYPE"], C[K]["documents"], C[K]["collections"]>(this.collections[name], this._provider, name as string);
	}
}

// Path is a shared base for both Document and Collection that defines a single path in the database.
abstract class Path<T extends Data, D extends DataSchemas, C extends DataSchemas> implements Validator<T> {
	protected readonly _provider: Provider;
	readonly schema: DataSchema<T, D, C>;
	readonly path: string;
	constructor(schema: DataSchema<T, D, C>, provider: Provider, path: string) {
		this.schema = schema;
		this._provider = provider;
		this.path = path;
	}
	validate(data: ImmutableObject, options?: ValidateOptions): T {
		try {
			return this.schema.validate(data, options);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid ${options?.partial ? "partial data" : "data"} for: "${this.path}"`, thrown, data);
			else throw thrown;
		}
	}
	validateResults(results: ImmutableObject<ImmutableObject>): Results<T> {
		const validated: MutableObject<T> = {};
		const invalids: MutableObject<InvalidFeedback> = {};
		let invalid = false;
		for (const [id, data] of Object.entries(results)) {
			try {
				validated[id] = this.schema.validate(data);
			} catch (thrown) {
				if (isFeedback(thrown)) invalids[id] = thrown;
				else throw thrown;
				invalid = true;
			}
		}
		if (invalid) throw new ValidationError(`Invalid documents for: "${this.path}"`, new InvalidFeedback("Invalid documents", invalids), results);
		return validated;
	}
	toString(): string {
		return this.path;
	}
}

// Implement Document.
class Document<T extends Data, D extends DataSchemas, C extends DataSchemas> extends Path<T, D, C> implements DocumentInterface<T, D, C> {
	readonly parent: string;
	readonly id: string;
	constructor(locus: DataSchema<T, D, C>, provider: Provider, parent: string, id: string) {
		super(locus, provider, `${parent}/${id}`);
		this.parent = parent;
		this.id = id;
	}

	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["TYPE"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["TYPE"], D[K]["documents"], D[K]["collections"]>(
			this.schema.documents[name],
			this._provider,
			`${this.path}/${DOCUMENT_PATH}`,
			name.toString(),
		);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["TYPE"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["TYPE"], C[K]["documents"], C[K]["collections"]>(this.schema.collections[name], this._provider, `${this.path}/${name}`);
	}
	get(options: GetOptions & { required: true }): Promise<T>;
	get(options?: GetOptions): Promise<Result<T>>;
	async get(options?: GetOptions): Promise<Result<T>> {
		const result = await this._provider.getDocument<T>(this);
		if (options?.required && !result) throw new DocumentRequiredError(this);
		return result;
	}
	get exists(): Promise<boolean> {
		return this.get().then(Boolean);
	}
	get result(): Promise<Result<T>> {
		return this.get();
	}
	get data(): Promise<T> {
		return this.get(GET_REQUIRED);
	}
	subscribe(next: Observer<Result<T>> | AsyncDispatcher<Result<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const stream = Stream.create<Result<T>>();
		stream.subscribe(next, error, complete);
		return this._provider.onDocument<T>(this, stream);
	}
	set(unvalidatedData: ImmutableObject, options?: SetOptions): Promise<void> {
		const data: T = options?.validate === false ? (unvalidatedData as T) : this.validate(unvalidatedData);
		return this._provider.setDocument<T>(this, data);
	}
	update(unvalidatedPartial: ImmutableObject, options?: SetOptions): Promise<void> {
		const partial: Partial<T> = options?.validate === false ? (unvalidatedPartial as Partial<T>) : this.validate(unvalidatedPartial, PARTIAL);
		if (options?.required === false) return this._provider.updateDocument<T>(this, partial).catch(dontThrowRequiredError);
		return this._provider.updateDocument<T>(this, partial);
	}
	async delete(options?: DeleteOptions): Promise<void> {
		await this._provider.deleteDocument<T>(this);
		if (options?.deep) {
			await Promise.all([
				...Object.keys(this.schema.documents).map(key => this.doc(key).delete(DELETE_DEEP)),
				...Object.keys(this.schema.collections).map(key => this.collection(key).delete(DELETE_DEEP)),
			]);
		}
	}
}

/** Collection defaults to empty query. */
const EMPTY_QUERY = new Query<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

// Implement collection.
class Collection<T extends Data, D extends DataSchemas, C extends DataSchemas> extends Path<T, D, C> implements CollectionInterface<T, D, C> {
	readonly query: Query<T> = EMPTY_QUERY;
	doc(id: string): Document<T, D, C> {
		return new Document(this.schema, this._provider, this.path, id);
	}
	add(data: T): Promise<string> {
		const safeData = this.validate(data);
		return this._provider.addDocument<T>(this, safeData);
	}
	get(): Promise<Results<T>> {
		return this._provider.getCollection<T>(this);
	}
	get results(): Promise<Results<T>> {
		return this._provider.getCollection<T>(this);
	}
	get count(): Promise<number> {
		return this._provider.countCollection<T>(this);
	}
	get ids(): Promise<string[]> {
		return this._provider.getCollection<T>(this).then(Object.keys);
	}
	subscribe(next: Observer<Results<T>> | AsyncDispatcher<Results<T>>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		const stream = Stream.create<Results<T>>();
		stream.subscribe(next, error, complete);
		return this._provider.onCollection<T>(this, stream);
	}
	get first(): Promise<Entry<T> | undefined> {
		return this._provider.getCollection<T>(this.limit(1)).then(getFirstProp);
	}
	get last(): Promise<Entry<T> | undefined> {
		return this._provider.getCollection<T>(this.limit(1)).then(getLastProp);
	}
	async set(unvalidatedData: T, options?: SetOptions): Promise<void> {
		const data = options?.validate === false ? (unvalidatedData as T) : this.validate(unvalidatedData);
		const ids = await this.ids;
		await Promise.all(ids.map(id => this.doc(id).set(data, SET_UNVALIDATED)));
	}
	async update(unvalidatedPartial: Partial<T>, options?: SetOptions): Promise<void> {
		const partial = options?.validate === false ? (unvalidatedPartial as Partial<T>) : this.validate(unvalidatedPartial, PARTIAL);
		const ids = await this.ids;
		await Promise.all(ids.map(id => this.doc(id).update(partial, SET_UNVALIDATED)));
	}
	async delete(options?: DeleteOptions): Promise<void> {
		const ids = await this.ids;
		const suboptions = options?.deep ? DELETE_DEEP : undefined;
		await Promise.all(ids.map(id => this.doc(id).delete(suboptions)));
	}
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.is<K>(key, value) };
	}
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.not<K>(key, value) };
	}
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.in<K>(key, value) };
	}
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.lt<K>(key, value) };
	}
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.lte<K>(key, value) };
	}
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.gt<K>(key, value) };
	}
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.gte<K>(key, value) };
	}
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.contains<K>(key, value) };
	}
	after(id: string, data: T): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.after(id, data) };
	}
	before(id: string, data: T): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.before(id, data) };
	}
	asc(key: "id" | (keyof T & string) = "id"): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.asc(key) };
	}
	desc(key: "id" | (keyof T & string) = "id"): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.desc(key) };
	}
	limit(limit: number | null): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.limit(limit) };
	}
	*[Symbol.iterator](): Generator<[string, T], void, undefined> {
		yield* Object.entries(this._provider.getCollection<T>(this));
	}
	@cacheMethod // Calculating the full path string is expensive so only do it once.
	toString(): string {
		return `${this.path}?${this.query}`;
	}
}

/** Is an unknown value a Collection instance. */
export const isCollection = <T extends CollectionInterface>(collection: T | unknown): collection is T => collection instanceof Collection;

/** Is an unknown value a Document instance. */
export const isDocument = <T extends DocumentInterface>(document: T | unknown): document is T => document instanceof Document;

/** Is an unknown value a Database instance. */
export const isDatabase = <T extends DatabaseInterface>(database: T | unknown): database is T => database instanceof Database;
