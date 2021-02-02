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
import { Document as DocumentInterface, DocumentGetOptions, DocumentSetOptions } from "./Document";
import { DOCUMENT_PATH } from "./constants";
import type { Provider } from "./Provider";
import type { Database as DatabaseInterface } from "./Database";
import type { Collection as CollectionInterface } from "./Collection";
import type { Reference as ReferenceInterface } from "./Reference";
import { ReferenceRequiredError, ReferenceValidationError } from "./errors";

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
	private readonly documents: D;
	private readonly collections: C;
	readonly provider: Provider;
	constructor(documents: D, collections: C, provider: Provider) {
		this.documents = documents;
		this.collections = collections;
		this.provider = provider;
	}
	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["DATA"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["DATA"], D[K]["documents"], D[K]["collections"]>(this.documents[name], this, DOCUMENT_PATH, name as string);
	}
	collection<K extends keyof C>(name: K): Collection<C[K]["DATA"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["DATA"], C[K]["documents"], C[K]["collections"]>(this.collections[name], this, name as string);
	}
	reset(): Promise<void> {
		return this.provider.reset();
	}
	clone(): this {
		return cloneObject<this>(this);
	}
}

// Implement Reference.
abstract class Reference<T extends Data, D extends DataSchemas, C extends DataSchemas> implements ReferenceInterface<T> {
	protected readonly schema: DataSchema<T, D, C>;
	protected readonly db: DatabaseInterface<DataSchemas, DataSchemas>;
	readonly path: string;
	constructor(schema: DataSchema<T, D, C>, db: DatabaseInterface<DataSchemas, DataSchemas>, path: string) {
		this.schema = schema;
		this.db = db;
		this.path = path;
	}
	validate(data: ImmutableObject): T {
		try {
			return this.schema.validate(data);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, data);
			else throw thrown;
		}
	}
	validateChange(change: ImmutableObject | undefined): Change<T> {
		try {
			return this.schema.partial.validate(change);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, change);
			else throw thrown;
		}
	}
	validateResults(results: ImmutableObject): Results<T> {
		try {
			return this.schema.results.validate(results);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, results);
			else throw thrown;
		}
	}
	validateChanges(changes: ImmutableObject): Changes<T> {
		try {
			return this.schema.changes.validate(changes);
		} catch (thrown: unknown) {
			if (isFeedback(thrown)) throw new ReferenceValidationError(this, thrown, changes);
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
class Document<T extends Data, D extends DataSchemas, C extends DataSchemas> extends Reference<T, D, C> implements DocumentInterface<T, D, C> {
	readonly parent: string;
	readonly id: string;
	constructor(locus: DataSchema<T, D, C>, db: DatabaseInterface<DataSchemas, DataSchemas>, parent: string, id: string) {
		super(locus, db, `${parent}/${id}`);
		this.parent = parent;
		this.id = id;
	}
	doc<K extends keyof D>(name: K): DocumentInterface<D[K]["DATA"], D[K]["documents"], D[K]["collections"]> {
		return new Document<D[K]["DATA"], D[K]["documents"], D[K]["collections"]>(
			this.schema.documents[name],
			this.db,
			`${this.path}/${DOCUMENT_PATH}`,
			name.toString(),
		);
	}
	collection<K extends keyof C>(name: K): CollectionInterface<C[K]["DATA"], C[K]["documents"], C[K]["collections"]> {
		return new Collection<C[K]["DATA"], C[K]["documents"], C[K]["collections"]>(this.schema.collections[name], this.db, `${this.path}/${name}`);
	}
	get docs(): DocumentInterface<D[string]["DATA"], D[string]["documents"], D[string]["collections"]>[] {
		return Object.keys(this.schema.documents).map(name => this.doc(name));
	}
	get collections(): CollectionInterface<D[string]["DATA"], C[string]["documents"], C[string]["collections"]>[] {
		return Object.keys(this.schema.collections).map(name => this.collection(name));
	}
	get(options: DocumentGetOptions & { required: true }): Promise<T>;
	get(options?: DocumentGetOptions): Promise<T>;
	async get(options?: DocumentGetOptions): Promise<Result<T>> {
		const result = await this.db.provider.getDocument<T>(this);
		if (options?.required && !result) throw new ReferenceRequiredError(this);
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
		return this.db.provider.onDocument<T>(this, r => dispatch(onNext, r, onError), onError);
	}
	set(change: Change<T>, options: DocumentSetOptions & { merge: true }): Promise<Change<T>>;
	set(data: ImmutableObject, options: DocumentSetOptions & { validate: false }): Promise<ImmutableObject>;
	set(data: T, options?: DocumentSetOptions): Promise<Change<T>>;
	set(input: ImmutableObject, options?: DocumentSetOptions): Promise<Change<T>> {
		const data: Change<T> = !options?.validate ? (input as Change<T>) : options?.merge ? this.validateChange(input) : this.validate(input);
		return this.db.provider.mergeDocument<T>(this, data);
	}
	merge(change: Change<T>): Promise<Change<T>> {
		return this.db.provider.mergeDocument<T>(this, this.validateChange(change));
	}
	delete(): Promise<void> {
		return this.db.provider.deleteDocument<T>(this);
	}
}

/** Collection defaults to empty query. */
const EMPTY_QUERY = createQuery<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

// Implement collection.
class Collection<T extends Data, D extends DataSchemas, C extends DataSchemas> extends Reference<T, D, C> implements CollectionInterface<T, D, C> {
	readonly query: Query<T> = EMPTY_QUERY;
	doc(id: string): Document<T, D, C> {
		return new Document(this.schema, this.db, this.path, id);
	}
	add(data: T): Promise<Entry<T>> {
		const safeData = this.validate(data);
		return this.db.provider.addDocument<T>(this, safeData);
	}
	get(): Promise<Results<T>> {
		return this.db.provider.getCollection<T>(this);
	}
	get results(): Promise<Results<T>> {
		return this.db.provider.getCollection<T>(this);
	}
	get count(): Promise<number> {
		return this.db.provider.countCollection<T>(this);
	}
	get ids(): Promise<string[]> {
		return this.db.provider.getCollection<T>(this).then(Object.keys);
	}
	on(onNext: AsyncDispatcher<Results<T>>, onError: ErrorDispatcher = logError): UnsubscribeDispatcher {
		return this.db.provider.onCollection<T>(this, r => dispatch(onNext, r, onError), onError);
	}
	get first(): Promise<Entry<T> | undefined> {
		return this.db.provider.getCollection<T>(this.limit(1)).then(getFirstProp);
	}
	get last(): Promise<Entry<T> | undefined> {
		return this.db.provider.getCollection<T>(this.limit(1)).then(getLastProp);
	}
	set(results: Results<T>): Promise<Changes<T>> {
		return this.db.provider.mergeCollection<T>(this, this.validateResults(results));
	}
	change(changes: Changes<T>): Promise<Changes<T>> {
		return this.db.provider.mergeCollection<T>(this, this.validateChanges(changes));
	}
	async setAll(data: T): Promise<Changes<T>> {
		const changes = mapObject(await this.db.provider.getCollection<T>(this), this.validate(data));
		return this.db.provider.mergeCollection<T>(this, changes);
	}
	async mergeAll(change: Change<T>): Promise<Changes<T>> {
		const changes = mapObject(await this.db.provider.getCollection<T>(this), this.validateChange(change));
		return this.db.provider.mergeCollection<T>(this, changes);
	}
	async deleteAll(): Promise<Changes<T>> {
		const changes = mapObject(await this.db.provider.getCollection<T>(this), undefined);
		return this.db.provider.mergeCollection<T>(this, changes);
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
		yield* Object.entries(this.db.provider.getCollection<T>(this));
	}
	toString(): string {
		return `${this.path}?${this.query}`;
	}
}
