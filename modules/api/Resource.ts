import { isFeedback } from "../feedback";
import { ValidationError } from "../errors";
import type { Arguments, AsyncFetcher } from "../function";
import { UNDEFINED_VALIDATOR, Validator } from "../schema";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions..
 *
 * @param payload The `Validator` the payload must conform to (defaults to `undefined` if not specified).
 * @param returns The `Validator` the function's returned value must conform to (defaults to `undefined` if not specified).
 */
export class Resource<P, R> {
	static create<X, Y>(payload: Validator<X>, result: Validator<Y>): Resource<X, Y>;
	static create<Y>(payload: undefined, result: Y): Resource<undefined, Y>;
	static create<X>(payload: Validator<X>, result?: undefined): Resource<X, undefined>;
	static create(payload?: undefined, result?: undefined): Resource<undefined, undefined>;
	static create(payload: Validator<unknown> = UNDEFINED_VALIDATOR, result: Validator<unknown> = UNDEFINED_VALIDATOR): Resource<unknown, unknown> {
		return new Resource(payload, result);
	}

	/** Expose the `P` internal payload type of this resource. */
	readonly PAYLOAD: P = undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

	/** Expose the `R` internal result type of this resource. */
	readonly RESULT: R = undefined as any; // eslint-disable-line @typescript-eslint/no-explicit-any

	/** Payload validator. */
	readonly payload: Validator<P>;

	/** Result validator. */
	readonly result: Validator<R>;

	protected constructor(payload: Validator<P>, result: Validator<R>) {
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Call a resource of this type, with a payload, and return the (async) result.
	 * - Validates the payload (before dispatching).
	 * - Validates the result (after dispatching).
	 *
	 * @param resource A resource function corresponding to the type of this resource.
	 * @param payload The payload to send to the resource (validated against the payload validator).
	 * @param ...args Any additional arguments to send to the resource.
	 *
	 * @returns The result returned from the resource (validated against the result validator).
	 *
	 * @throws InvalidFeedback If the payload could not be validated.
	 * @throws unknown Anything the function itself throws is thrown.
	 * @throws ValidationError If the result could not be validated.
	 */
	async call<A extends Arguments>(resource: AsyncFetcher<R, [P, ...A]>, payload: unknown, ...args: A): Promise<R> {
		const result = await resource(this.payload.validate(payload), ...args);
		try {
			return this.result.validate(result);
		} catch (thrown) {
			if (isFeedback(thrown)) throw new ValidationError("Resource returned invalid result", thrown);
			throw thrown;
		}
	}
}
