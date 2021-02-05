import { Validator } from "../schema";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions..
 * Multiple resources are composed into a complete API for an app.
 *
 * Resource is defined by the following properties:
 *
 * @param auth Whether an auth token must be supplied to run this function.
 * @param payload The `Validator` the payload must conform to (defaults to `undefined` if not specified).
 * @param returns The `Validator` the function's returned value must conform to (defaults to `undefined` if not specified).
 */
export interface Resource<P, R> {
	readonly payload: Validator<P>;
	readonly result: Validator<R>;
}

export type PayloadType<R extends Resource<unknown, unknown>> = ReturnType<R["payload"]["validate"]>;
export type ResultType<R extends Resource<unknown, unknown>> = ReturnType<R["result"]["validate"]>;
