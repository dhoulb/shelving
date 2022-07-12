import type { Transformable } from "../util/transform.js";
import { Validator, Validatable, validate } from "../util/validate.js";

/**
 * An object that represents an update of an existing value.
 * - Implements `Transformable` for applying that update with its `transform()` method.
 */
export abstract class Update<T> implements Transformable<T, T>, Validatable<Update<T>> {
	/** Apply this update to a value. */
	abstract transform(value?: unknown): T;

	/** Validate this update's values against a validator. */
	validate(validator: Validator<T>): this {
		validate(this.transform(), validator);
		return this;
	}
}
