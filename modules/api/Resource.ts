import { Validator, Validatable, UNDEFINED, validate } from "../util/index.js";
import { Feedback, throwFeedback } from "../feedback/index.js";
import { ResourceValidationError } from "./errors.js";

/** Validator that always returns void/undefined. */
const UNDEFINED_VALIDATOR: Validator<undefined> = UNDEFINED;

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions..
 *
 * @param payload The `Validator` the payload must conform to (defaults to `undefined` if not specified).
 * @param returns The `Validator` the function's returned value must conform to (defaults to `undefined` if not specified).
 */
export class Resource<P = unknown, R = void> implements Validatable<R> {
	static create<X, Y>(payload: Validator<X>, result: Validator<Y>): Resource<X, Y>;
	static create<Y>(payload: undefined, result: Y): Resource<undefined, Y>;
	static create<X>(payload: Validator<X>, result?: undefined): Resource<X, void>;
	static create(payload?: undefined, result?: undefined): Resource<undefined, void>;
	static create(payload: Validator<unknown> = UNDEFINED_VALIDATOR, result: Validator<unknown> = UNDEFINED_VALIDATOR): Resource<unknown, unknown> {
		return new Resource(payload, result);
	}

	/** Payload validator. */
	readonly payload: Validator<P>;

	/** Result validator. */
	readonly result: Validator<R>;

	// Protected to require use of `Resource.create()`
	protected constructor(payload: Validator<P>, result: Validator<R>) {
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Validate a payload for this resource.
	 *
	 */
	validatePayload(unsafePayload: unknown): P {
		return throwFeedback(validate(unsafePayload, this.payload));
	}

	/**
	 * Validate a result for this resource.
	 *
	 * @returns The validated payload for this resource.
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
