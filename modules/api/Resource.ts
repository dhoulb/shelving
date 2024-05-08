import { ValueError } from "../error/ValueError.js";
import { Feedback } from "../feedback/Feedback.js";
import type { Validator } from "../util/validate.js";
import { UNDEFINED_VALIDATOR } from "../util/validate.js";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions..
 *
 * @param name The name of the resource.
 * @param payload The `Validator` the resource's payload must conform to (defaults to `undefined` if not specified).
 * @param returns The `Validator` the resource's returned value must conform to (defaults to `undefined` if not specified).
 */
export class Resource<P = undefined, R = void> implements Validator<R> {
	/** Resource name.. */
	readonly name: string;

	/** Payload validator. */
	readonly payload: Validator<P>;

	/** Result validator. */
	readonly result: Validator<R>;

	constructor(name: string, payload: Validator<P>, result: Validator<R>);
	constructor(name: string, payload: Validator<P>);
	constructor(name: string);
	constructor(
		name: string,
		payload: Validator<P> = UNDEFINED_VALIDATOR as Validator<P>,
		result: Validator<R> = UNDEFINED_VALIDATOR as Validator<R>,
	) {
		this.name = name;
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Validate a payload for this resource.
	 *
	 * @returns The validated payload for this resource.
	 * @throws Feedback if the payload could not be validated.
	 */
	prepare(unsafePayload: unknown): P {
		return this.payload?.validate(unsafePayload);
	}

	/**
	 * Validate a result for this resource.
	 *
	 * @returns The validated result for this resource.
	 * @throws ValidationError if the result could not be validated.
	 */
	validate(unsafeResult: unknown): R {
		try {
			return this.result.validate(unsafeResult);
		} catch (thrown) {
			if (thrown instanceof Feedback) throw new ValueError("Invalid result for resource", thrown);
			throw thrown;
		}
	}
}

/** Extract the payload type from a `Resource`. */
export type PayloadType<X extends Resource> = X extends Resource<infer Y, unknown> ? Y : never;

/** Extract the result type from a `Resource`. */
export type ResourceType<X extends Resource> = X extends Resource<unknown, infer Y> ? Y : never;
