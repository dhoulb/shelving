import { cloneObject } from "../clone";
import { EmptyObject, getFirstProp, getLastProp, ImmutableObject, mapObject } from "../object";
import { DataSchemas, DataSchema } from "../schema";
import { Data, Change, Result, Results, Changes } from "../data";
import { AsyncDispatcher, dispatch, ErrorDispatcher, UnsubscribeDispatcher } from "../dispatch";
import { logError } from "../console";
import { isFeedback } from "../feedback";
import { createQuery, Query } from "../query";
import { Entry } from "../entry";
import { ArrayType, ImmutableArray } from "../array";
import { ValidationError } from "../errors";
import { Document as DocumentInterface, DocumentDeleteOptions, DocumentGetOptions, DocumentSetOptions } from "./Document";
import { DOCUMENT_PATH } from "./constants";
import type { Provider } from "./Provider";
import type { Database as DatabaseInterface } from "./Database";
import type { Collection as CollectionInterface, CollectionDeleteOptions } from "./Collection";
import { DocumentRequiredError } from "./errors";

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
	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["type"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["type"], D[K]["documents"], D[K]["collections"]>(this.documents[name], this._provider, DOCUMENT_PATH, name as string);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["type"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["type"], C[K]["documents"], C[K]["collections"]>(this.collections[name], this._provider, name as string);
	}
	clone(): this {
		return cloneObject<this>(this);
	}
}

// Path is a shared base for both Document and Collection that defines a single path in the database.
abstract class Path<T extends Data, D extends DataSchemas, C extends DataSchemas> {
	protected readonly _provider: Provider;
	readonly schema: DataSchema<T, D, C>;
	readonly path: string;
	constructor(schema: DataSchema<T, D, C>, provider: Provider, path: string) {
		this.schema = schema;
		this._provider = provider;
		this.path = path;
	}
	validate(data: ImmutableObject): T {
		try {
			return this.schema.validate(data);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid value for: "${this.path}"`, thrown, data);
			else throw thrown;
		}
	}
	validateChange(change: ImmutableObject | undefined): Change<T> {
		try {
			return this.schema.partial.validate(change);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid change for: "${this.path}"`, thrown, change);
			else throw thrown;
		}
	}
	validateResults(results: ImmutableObject): Results<T> {
		try {
			return this.schema.results.validate(results);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid results for: "${this.path}"`, thrown, results);
			else throw thrown;
		}
	}
	validateChanges(changes: ImmutableObject): Changes<T> {
		try {
			return this.schema.changes.validate(changes);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid changes for: "${this.path}"`, thrown, changes);
			else throw thrown;
		}
	}
	toString(): string {
		return this.path;
	}
	clone(): this {
		return cloneObject(this);
	}
}

const REQUIRED = { required: true };

// Implement Document.
class Document<T extends Data, D extends DataSchemas, C extends DataSchemas> extends Path<T, D, C> implements DocumentInterface<T, D, C> {
	readonly parent: string;
	readonly id: string;
	constructor(locus: DataSchema<T, D, C>, provider: Provider, parent: string, id: string) {
		super(locus, provider, `${parent}/${id}`);
		this.parent = parent;
		this.id = id;
	}
	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["type"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["type"], D[K]["documents"], D[K]["collections"]>(
			this.schema.documents[name],
			this._provider,
			`${this.path}/${DOCUMENT_PATH}`,
			name.toString(),
		);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["type"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["type"], C[K]["documents"], C[K]["collections"]>(this.schema.collections[name], this._provider, `${this.path}/${name}`);
	}
	get(options: DocumentGetOptions & { required: true }): Promise<T>;
	get(options?: DocumentGetOptions): Promise<T>;
	async get(options?: DocumentGetOptions): Promise<Result<T>> {
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
		return this.get(REQUIRED);
	}
	on(onNext: AsyncDispatcher<Result<T>>, onError: ErrorDispatcher = logError): UnsubscribeDispatcher {
		return this._provider.onDocument<T>(this, r => dispatch(onNext, r, onError), onError);
	}
	set(change: Change<T>, options: DocumentSetOptions & { merge: true }): Promise<void>;
	set(data: ImmutableObject, options: DocumentSetOptions & { validate: false }): Promise<void>;
	set(data: T, options?: DocumentSetOptions): Promise<void>;
	set(input: ImmutableObject, options?: DocumentSetOptions): Promise<void> {
		const data: Change<T> = !options?.validate ? (input as Change<T>) : options?.merge ? this.validateChange(input) : this.validate(input);
		return this._provider.mergeDocument<T>(this, data);
	}
	merge(change: Change<T>): Promise<void> {
		return this._provider.mergeDocument<T>(this, this.validateChange(change));
	}
	async delete(options?: DocumentDeleteOptions): Promise<void> {
		await this._provider.deleteDocument<T>(this);
		if (options?.deep) {
			await Promise.all<Promise<unknown>>([
				...Object.keys(this.schema.documents).map(key => this.doc(key).delete({ deep: true })),
				...Object.keys(this.schema.collections).map(key => this.collection(key).deleteAll({ deep: true })),
			]);
		}
	}
}

/** Collection defaults to empty query. */
const EMPTY_QUERY = createQuery<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

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
	on(onNext: AsyncDispatcher<Results<T>>, onError: ErrorDispatcher = logError): UnsubscribeDispatcher {
		return this._provider.onCollection<T>(this, r => dispatch(onNext, r, onError), onError);
	}
	get first(): Promise<Entry<T> | undefined> {
		return this._provider.getCollection<T>(this.limit(1)).then(getFirstProp);
	}
	get last(): Promise<Entry<T> | undefined> {
		return this._provider.getCollection<T>(this.limit(1)).then(getLastProp);
	}
	set(results: Results<T>): Promise<void> {
		return this._provider.changeDocuments<T>(this, this.validateResults(results));
	}
	change(changes: Changes<T>): Promise<void> {
		return this._provider.changeDocuments<T>(this, this.validateChanges(changes));
	}
	async setAll(data: T): Promise<void> {
		const changes = mapObject(await this._provider.getCollection<T>(this), this.validate(data));
		await this._provider.changeDocuments<T>(this, changes);
	}
	async mergeAll(change: Change<T>): Promise<void> {
		const changes = mapObject(await this._provider.getCollection<T>(this), this.validateChange(change));
		return this._provider.changeDocuments<T>(this, changes);
	}
	async deleteAll(options?: CollectionDeleteOptions): Promise<void> {
		const changes = mapObject(await this._provider.getCollection<T>(this), undefined);
		await this._provider.changeDocuments<T>(this, changes);
		if (options?.deep) await Promise.all(Object.keys(changes).map(id => this.doc(id).delete({ deep: true })));
	}
	is<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.is<K>(key, value) };
	}
	not<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.not<K>(key, value) };
	}
	in<K extends "id" | keyof T>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.in<K>(key, value) };
	}
	lt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.lt<K>(key, value) };
	}
	lte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.lte<K>(key, value) };
	}
	gt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.gt<K>(key, value) };
	}
	gte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.gte<K>(key, value) };
	}
	contains<K extends keyof T>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.contains<K>(key, value) };
	}
	asc(key: "id" | keyof T = "id"): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.asc(key) };
	}
	desc(key: "id" | keyof T = "id"): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.desc(key) };
	}
	limit(limit: number | null): this {
		return { __proto__: Collection.prototype, ...this, query: this.query.limit(limit) };
	}
	*[Symbol.iterator](): Generator<[string, T], void, undefined> {
		yield* Object.entries(this._provider.getCollection<T>(this));
	}
	toString(): string {
		return `${this.path}?${this.query}`;
	}
}
