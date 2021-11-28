import { Derivable } from "../util/index.js";

/**
 * An object that transforms an existing value value into a new value with its `transform()` method.
 * - Probably has a configuration that accompanies it.
 */
export abstract class Transform<T> implements Derivable<T, T> {
	/** Apply this transform to a value. */
	abstract derive(existing?: unknown): T;
}
