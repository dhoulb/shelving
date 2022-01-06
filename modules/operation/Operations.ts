import { ImmutableArray, callAsyncSeries, callAsyncParallel, Nullish, isNullish, Arguments, isNotNullish } from "../util/index.js";
import { Operation } from "./Operation.js";

// Run an operation on to a database.
const _runOperation = <A extends Arguments>(operation: Operation<A>, ...args: A): PromiseLike<Operation<A>> => operation.run(...args);

/** Represent a list of operations that take the same arguments. */
export abstract class Operations<A extends Arguments> extends Operation<A> {
	readonly operations: ImmutableArray<Operation<A>>;
	constructor(...operations: Nullish<Operation<A>>[]) {
		super();
		this.operations = operations.filter(isNotNullish);
	}

	/** Return a new instance of this object with an additional operation added. */
	with(operation: Nullish<Operation<A>>) {
		if (isNullish(operation)) return this;
		return { __proto__: Object.getPrototypeOf(this), ...this, operations: [...this.operations, operation] };
	}
}

/** Represent a list of operations run in series. */
export class SeriesOperations<A extends Arguments> extends Operations<A> {
	async run(...args: A): Promise<SeriesOperations<A>> {
		return new SeriesOperations(...(await callAsyncSeries(_runOperation, this.operations, ...args)));
	}
}

/** Create a list of operations to be run. */
export const SERIES = <A extends Arguments>(...operations: Operation<A>[]): SeriesOperations<A> => new SeriesOperations<A>(...operations);

/** Represent a list of operations run in series. */
export class ParallelOperations<A extends Arguments> extends Operations<A> {
	async run(...args: A): Promise<ParallelOperations<A>> {
		return new ParallelOperations<A>(...(await callAsyncParallel(_runOperation, this.operations, ...args)));
	}
}

/** Create a list of operations to be run. */
export const PARALLEL = <A extends Arguments>(...operations: Operation<A>[]): ParallelOperations<A> => new ParallelOperations<A>(...operations);
