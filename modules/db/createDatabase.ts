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
import { Document as DocumentInterface, DocumentGetOptions, DocumentSetOptions } from "./Document";
import { DOCUMENT_PATH } from "./constants";
import type { Provider } from "./Provider";
import type { Database as DatabaseInterface } from "./Database";
import type { Collection as CollectionInterface } from "./Collection";
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
	protected readonly _documents: D;
	protected readonly _collections: C;
	protected readonly _provider: Provider;
	constructor(documents: D, collections: C, provider: Provider) {
		this._documents = documents;
		this._collections = collections;
		this._provider = provider;
	}
	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["type"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["type"], D[K]["documents"], D[K]["collections"]>(this._documents[name], this._provider, DOCUMENT_PATH, name as string);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["type"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["type"], C[K]["documents"], C[K]["collections"]>(this._collections[name], this._provider, name as string);
	}
	get documents(): DocumentInterface<D[keyof D]["type"], D[keyof D]["documents"], D[keyof D]["collections"]>[] {
		return Object.keys(this._documents).map(name => this.doc(name));
	}
	get collections(): CollectionInterface<C[keyof C]["type"], C[keyof C]["documents"], C[keyof C]["collections"]>[] {
		return Object.keys(this._collections).map(name => this.collection(name));
	}
	clone(): this {
		return cloneObject<this>(this);
	}
}

// Path is a shared base for both Document and Collection that defines a single path in the database.
abstract class Path<T extends Data, D extends DataSchemas, C extends DataSchemas> {
	protected readonly _schema: DataSchema<T, D, C>;
	protected readonly _provider: Provider;
	readonly path: string;
	constructor(schema: DataSchema<T, D, C>, provider: Provider, path: string) {
		this._schema = schema;
		this._provider = provider;
		this.path = path;
	}
	validate(data: ImmutableObject): T {
		try {
			return this._schema.validate(data);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid value for: "${this.path}"`, thrown, data);
			else throw thrown;
		}
	}
	validateChange(change: ImmutableObject | undefined): Change<T> {
		try {
			return this._schema.partial.validate(change);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid change for: "${this.path}"`, thrown, change);
			else throw thrown;
		}
	}
	validateResults(results: ImmutableObject): Results<T> {
		try {
			return this._schema.results.validate(results);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ValidationError(`Invalid results for: "${this.path}"`, thrown, results);
			else throw thrown;
		}
	}
	validateChanges(changes: ImmutableObject): Changes<T> {
		try {
			return this._schema.changes.validate(changes);
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
			this._schema.documents[name],
			this._provider,
			`${this.path}/${DOCUMENT_PATH}`,
			name.toString(),
		);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["type"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["type"], C[K]["documents"], C[K]["collections"]>(this._schema.collections[name], this._provider, `${this.path}/${name}`);
	}
	get documents(): DocumentInterface<D[keyof D]["type"], D[keyof D]["documents"], D[keyof D]["collections"]>[] {
		return Object.keys(this._schema.documents).map(name => this.doc(name));
	}
	get collections(): CollectionInterface<C[keyof C]["type"], C[keyof C]["documents"], C[keyof C]["collections"]>[] {
		return Object.keys(this._schema.collections).map(name => this.collection(name));
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
	set(change: Change<T>, options: DocumentSetOptions & { merge: true }): Promise<Change<T>>;
	set(data: ImmutableObject, options: DocumentSetOptions & { validate: false }): Promise<Change<T>>;
	set(data: T, options?: DocumentSetOptions): Promise<Change<T>>;
	set(input: ImmutableObject, options?: DocumentSetOptions): Promise<Change<T>> {
		const data: Change<T> = !options?.validate ? (input as Change<T>) : options?.merge ? this.validateChange(input) : this.validate(input);
		return this._provider.mergeDocument<T>(this, data);
	}
	merge(change: Change<T>): Promise<Change<T>> {
		return this._provider.mergeDocument<T>(this, this.validateChange(change));
	}
	delete(): Promise<void> {
		return this._provider.deleteDocument<T>(this);
	}
}

/** Collection defaults to empty query. */
const EMPTY_QUERY = createQuery<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

// Implement collection.
class Collection<T extends Data, D extends DataSchemas, C extends DataSchemas> extends Path<T, D, C> implements CollectionInterface<T, D, C> {
	readonly query: Query<T> = EMPTY_QUERY;
	doc(id: string): Document<T, D, C> {
		return new Document(this._schema, this._provider, this.path, id);
	}
	add(data: T): Promise<Entry<T>> {
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
	set(results: Results<T>): Promise<Changes<T>> {
		return this._provider.mergeCollection<T>(this, this.validateResults(results));
	}
	change(changes: Changes<T>): Promise<Changes<T>> {
		return this._provider.mergeCollection<T>(this, this.validateChanges(changes));
	}
	async setAll(data: T): Promise<Changes<T>> {
		const changes = mapObject(await this._provider.getCollection<T>(this), this.validate(data));
		return this._provider.mergeCollection<T>(this, changes);
	}
	async mergeAll(change: Change<T>): Promise<Changes<T>> {
		const changes = mapObject(await this._provider.getCollection<T>(this), this.validateChange(change));
		return this._provider.mergeCollection<T>(this, changes);
	}
	async deleteAll(): Promise<Changes<T>> {
		const changes = mapObject(await this._provider.getCollection<T>(this), undefined);
		return this._provider.mergeCollection<T>(this, changes);
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
