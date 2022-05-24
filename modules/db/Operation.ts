import type { PropUpdates } from "../update/DataUpdate.js";
import { Update } from "../update/Update.js";
import { ImmutableArray } from "../util/array.js";
import { callAsyncSeries } from "../util/async.js";
import { Data, Key } from "../util/data.js";
import { Hydrations } from "../util/hydrate.js";
import { isNullish, notNullish, Nullish } from "../util/null.js";
import type { Database } from "./Database.js";
import type { DocumentReference, QueryReference } from "./Reference.js";

/** Represent a write operation on a database. */
export abstract class Operation {
	/** Run this operation and return the result operation. */
	abstract run(db: Database): Promise<Operation>;
}

/** Represent a list of write operations on a database run in series. */
export class Operations extends Operation {
	readonly operations: ImmutableArray<Operation>;
	constructor(...operations: Nullish<Operation>[]) {
		super();
		this.operations = operations.filter(notNullish);
	}
	async run(db: Database): Promise<Operations> {
		const ops = await callAsyncSeries(_run, this.operations, db);
		return new Operations(...ops);
	}

	/** Return a new write operations list with an additional write operation added. */
	with(...operations: Nullish<Operation>[]) {
		return { __proto__: Object.getPrototypeOf(this), ...this, operations: [...this.operations, operations] };
	}
}
const _run = (operation: Operation, db: Database): PromiseLike<Operation> => operation.run(db);

/** Represent a add operation made to a collection in a database. */
export class AddOperation<T extends Data> extends Operation {
	/** Create a new add operation on a collection. */
	static on<X extends Data>({ collection }: DocumentReference<X> | QueryReference<X>, data: X): AddOperation<X> {
		return new AddOperation(collection, data);
	}

	/** Run a new add operation on a collection and return the result operation. */
	static run<X extends Data>({ collection, db }: DocumentReference<X> | QueryReference<X>, data: X): Promise<SetOperation<X>> {
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
	static on<X extends Data>({ collection, id }: DocumentReference<X>, data: X): SetOperation<X> {
		return new SetOperation(collection, id, data);
	}

	/** Run a new set operation on a collection and return the result operation. */
	static run<X extends Data>({ collection, id, db }: DocumentReference<X>, data: X): Promise<SetOperation<X>> {
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
	static on<X extends Data>({ collection, id }: DocumentReference<X>, updates: PropUpdates<X>): UpdateOperation<X> {
		return new UpdateOperation(collection, id, updates);
	}

	/** Run a new set operation on a collection and return the result operation. */
	static run<X extends Data>({ collection, id, db }: DocumentReference<X>, updates: PropUpdates<X>): Promise<UpdateOperation<X>> {
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
	static on<X extends Data>({ collection, id }: DocumentReference<X>): DeleteOperation {
		return new DeleteOperation(collection, id);
	}

	/** Run a new delete operation on a document. */
	static run<X extends Data>({ collection, id, db }: DocumentReference<X>): Promise<DeleteOperation> {
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
export const OPERATION_HYDRATIONS: Hydrations = {
	Operations,
	AddOperation,
	SetOperation,
	UpdateOperation,
	DeleteOperation,
};
