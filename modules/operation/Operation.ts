import { Arguments } from "../index.js";

/** Represent an async operation. */
export abstract class Operation<A extends Arguments = []> {
	/** Run this operation against a database and return the operation that was completed (which may be this same `Operation` instance). */
	abstract run(...args: A): Promise<Operation<A>>;
}
