import type { Transformable } from "../util/transform.js";

/**
 * An object that represents an update of an existing value.
 * - Implements `Transformable` for applying that update with its `transform()` method.
 */
export abstract class Update<T> implements Transformable<T, T> {
	/** Apply this update to a value. */
	abstract transform(value?: unknown): T;
}
