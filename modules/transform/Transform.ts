import { Transformable } from "../util/index.js";

/**
 * An object that transforms an existing value value into a new value with its `transform()` method.
 * - Probably has a configuration that accompanies it.
 */
export abstract class Transform<T> implements Transformable<T, T> {
	/** Apply this transform to a value. */
	abstract transform(existing?: unknown): T;
}
