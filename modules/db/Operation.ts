import { PropUpdates, Update } from "../update/index.js";
import { ImmutableArray, callAsyncSeries, Nullish, notNullish, Data, Hydrations, isNullish, Key } from "../util/index.js";
import type { Database, DatabaseDocument, DatabaseQuery } from "./Database.js";

/** Represent a write operation on a database. */
export abstract class Operation {
	/** Run this operation and return the result operation. */
	abstract run(db: Database): Promise<Operation>;
}

/** Represent a list of write operations on a database run in series. */
export class Operations extends Operation {
	/** Return a new write operations list with a set of write operations. */
	static with(...operations: Nullish<Operation>[]) {
		return new Operations(operations);
	}

	readonly operations: ImmutableArray<Operation>;
	constructor(operations: ImmutableArray<Nullish<Operation>>) {
		super();
		this.operations = operations.filter(notNullish);
	}
	async run(db: Database): Promise<Operations> {
		return new Operations(await callAsyncSeries(_write, this.operations, db));
	}

	/** Return a new write operations list with an additional write operation added. */
	with(...operations: Nullish<Operation>[]) {
		return { __proto__: Object.getPrototypeOf(this), ...this, operations: [...this.operations, operations] };
	}
}
const _write = (operation: Operation, db: Database): PromiseLike<Operation> => operation.run(db);

/** Represent a add operation made to a collection in a database. */
export class AddOperation<T extends Data> extends Operation {
	/** Create a new add operation on a collection. */
	static on<X extends Data>({ collection }: DatabaseDocument<X> | DatabaseQuery<X>, data: X): AddOperation<X> {
		return new AddOperation(collection, data);
	}

	/** Run a new add operation on a collection and return the result operation. */
	static run<X extends Data>({ collection, db }: DatabaseDocument<X> | DatabaseQuery<X>, data: X): Promise<SetOperation<X>> {
		return new AddOperation(collection, data).run(db);
	}

	readonly collection: string;
	readonly data: T;
	constructor(collection: string, data: T) {
		super();
		this.collection = collection;
		this.data = data;
	}
	async run(db: Database): Promise<SetOperation<T>> {
		const id = await db.query(this.collection).add(this.data);
		return new SetOperation<T>(this.collection, id, this.data); // When an add operation is run it returns a set operation so the operation is repeatable.
	}

	/** Set one of the props on this set operation to a different value. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K]): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, data: { ...this.data, [key]: value } };
	}
}

/** Represent a set operation made to a single document in a database. */
export class SetOperation<T extends Data> extends Operation {
	/** Create a new add operation on a collection. */
	static on<X extends Data>({ collection, id }: DatabaseDocument<X>, data: X): SetOperation<X> {
		return new SetOperation(collection, id, data);
	}

	/** Run a new set operation on a collection and return the result operation. */
	static run<X extends Data>({ collection, id, db }: DatabaseDocument<X>, data: X): Promise<SetOperation<X>> {
		return new SetOperation(collection, id, data).run(db);
	}

	readonly collection: string;
	readonly id: string;
	readonly data: T;
	constructor(collection: string, id: string, data: T) {
		super();
		this.collection = collection;
		this.id = id;
		this.data = data;
	}
	async run(db: Database): Promise<this> {
		await db.doc(this.collection, this.id).set(this.data);
		return this;
	}

	/** Set one of the props on this set operation to a different value. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K]): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, data: { ...this.data, [key]: value } };
	}
}

/** Represent an update operation made to a single document in a database. */
export class UpdateOperation<T extends Data> extends Operation {
	/** Create a new update operation on a document. */
	static on<X extends Data>({ collection, id }: DatabaseDocument<X>, updates: PropUpdates<X>): UpdateOperation<X> {
		return new UpdateOperation(collection, id, updates);
	}

	/** Run a new set operation on a collection and return the result operation. */
	static run<X extends Data>({ collection, id, db }: DatabaseDocument<X>, updates: PropUpdates<X>): Promise<UpdateOperation<X>> {
		return new UpdateOperation(collection, id, updates).run(db);
	}

	readonly collection: string;
	readonly id: string;
	readonly updates: PropUpdates<T>;
	constructor(collection: string, id: string, updates: PropUpdates<T>) {
		super();
		this.collection = collection;
		this.id = id;
		this.updates = updates;
	}
	async run(db: Database): Promise<this> {
		await db.doc(this.collection, this.id).update(this.updates);
		return this;
	}

	/** update one of the props on this set operation to a different value. */
	with<K extends Key<T>>(key: Nullish<K>, value: T[K] | Update<T[K]>): this {
		if (isNullish(key)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, updates: { ...this.updates, [key]: value } };
	}
}

/** Represent a delete operation made to a single document in a database. */
export class DeleteOperation extends Operation {
	/** Create a new delete operation on a document. */
	static on<X extends Data>({ collection, id }: DatabaseDocument<X>): DeleteOperation {
		return new DeleteOperation(collection, id);
	}

	/** Run a new delete operation on a document. */
	static run<X extends Data>({ collection, id, db }: DatabaseDocument<X>): Promise<DeleteOperation> {
		return new DeleteOperation(collection, id).run(db);
	}

	readonly collection: string;
	readonly id: string;
	constructor(collection: string, id: string) {
		super();
		this.collection = collection;
		this.id = id;
	}
	async run(db: Database): Promise<this> {
		await db.doc(this.collection, this.id).delete();
		return this;
	}
}

/** Set of hydrations for all change classes. */
export const OPERATION_HYDRATIONS = {
	Operations: Operations,
	AddOperation,
	SetOperation,
	UpdateOperation,
	DeleteOperation,
};
OPERATION_HYDRATIONS as Hydrations;
