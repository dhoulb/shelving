import type { Transformable } from "../util/transform.js";
import { Validator, Validatable, validate } from "../util/validate.js";

/**
 * An object that represents an update of an existing value.
 * - Implements `Transformable` for applying that update with its `transform()` method.
 */
export abstract class Update<T> implements Transformable<T, T>, Validatable<Update<T>> {
	//  Must implement `Transformable`
	abstract transform(value?: unknown): T;

	// Implement `Validatable`
	validate(validator: Validator<T>): this {
		validate(this.transform(), validator);
		return this;
	}
}
