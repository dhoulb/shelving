import type { Database } from "../db/Database.js";
import { ImmutableArray, callAsyncSeries, Nullish, isNullish, isNotNullish } from "../util/index.js";
import { Operation } from "./Operation.js";

/** Represent a write operation on a database. */
export abstract class WriteOperation extends Operation<[Database]> {}

/** Represent a list of write operations on a database run in series. */
export class WriteOperations extends WriteOperation {
	readonly operations: ImmutableArray<WriteOperation>;
	constructor(...operations: Nullish<WriteOperation>[]) {
		super();
		this.operations = operations.filter(isNotNullish);
	}
	async run(db: Database): Promise<WriteOperations> {
		return new WriteOperations(...(await callAsyncSeries(_write, this.operations, db)));
	}

	/** Return a new instance of this object with an additional operation added. */
	with(operation: Nullish<WriteOperation>) {
		if (isNullish(operation)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, operations: [...this.operations, operation] };
	}
}

// Run an operation on to a database.
const _write = (operation: WriteOperation, db: Database): PromiseLike<WriteOperation> => operation.run(db);

/** Create a list of operations to be run. */
export const WRITES = (...operations: WriteOperation[]): WriteOperations => new WriteOperations(...operations);
