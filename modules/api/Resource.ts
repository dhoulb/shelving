import { Validator, Validatable, getUndefined, validate } from "../util/index.js";
import { Feedback } from "../feedback/index.js";
import { ResourceValidationError } from "./errors.js";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions..
 *
 * @param payload The `Validator` the payload must conform to (defaults to `undefined` if not specified).
 * @param returns The `Validator` the function's returned value must conform to (defaults to `undefined` if not specified).
 */
export class Resource<P = unknown, R = void> implements Validatable<R> {
	/** Payload validator. */
	readonly payload: Validator<P>;

	/** Result validator. */
	readonly result: Validator<R>;

	// Protected to require use of `Resource.create()`
	constructor(payload: Validator<P>, result: Validator<R>) {
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Validate a payload for this resource.
	 *
	 * @returns The validated payload for this resource.
	 * @throws InvalidFeedback if the payload could not be validated.
	 */
	prepare(unsafePayload: unknown): P {
		return validate(unsafePayload, this.payload);
	}

	/**
	 * Validate a result for this resource.
	 *
	 * @returns The validated result for this resource.
	 * @throws ValidationError if the result could not be validated.
	 */
	validate(unsafeResult: unknown): R {
		try {
			return validate(unsafeResult, this.result);
		} catch (thrown) {
			throw thrown instanceof Feedback ? new ResourceValidationError(this, thrown) : thrown;
		}
	}
}

/** Extract the payload type from a `Resource`. */
export type PayloadType<X extends Resource> = X extends Resource<infer Y, unknown> ? Y : never;

/** Extract the result type from a `Resource`. */
export type ResourceType<X extends Resource> = X extends Resource<unknown, infer Y> ? Y : never;

/**
 * Shortcut to create a new `Resource` (consistent with `Schema` shortcuts.
 * - Sets `undefined` as the default type for payload and result.
 */
export function RESOURCE<X, Y>(payload: Validator<X>, result: Validator<Y>): Resource<X, Y>;
export function RESOURCE<Y>(payload: undefined, result: Y): Resource<undefined, Y>;
export function RESOURCE<X>(payload: Validator<X>, result?: undefined): Resource<X, void>;
export function RESOURCE(payload?: undefined, result?: undefined): Resource<undefined, void>;
export function RESOURCE(payload: Validator<unknown> = getUndefined, result: Validator<unknown> = getUndefined): Resource<unknown, unknown> {
	return new Resource(payload, result);
}
