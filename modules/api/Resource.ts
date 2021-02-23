import type { Arguments } from "../function";
import type { Validator } from "../schema";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions..
 * Multiple resources are composed into a complete API for an app.
 *
 * Resource is defined by the following properties:
 *
 * @param auth Whether an auth token must be supplied to run this function.
 * @param payload The `Validator` the payload must conform to (defaults to `undefined` if not specified).
 * @param ...args Any additional arguments to send to the resource.
 * @param returns The `Validator` the function's returned value must conform to (defaults to `undefined` if not specified).
 */
export interface Resource<P, R> {
	readonly payload: Validator<P>;
	readonly result: Validator<R>;
	resolve<A extends Arguments>(resolver: ResourceResolver<P, unknown, A>, payload: unknown, ...args: A): Promise<R>;
}

export type ResourcePayloadType<R extends Resource<unknown, unknown>> = ReturnType<R["payload"]["validate"]>;
export type ResourceResultType<R extends Resource<unknown, unknown>> = ReturnType<R["result"]["validate"]>;

/**
 * Function that resolves a resource by dispatching its payload and return its return type.
 * @param payload The payload for the resource.
 * @param ...args Any additional arguments to send to the resolver.
 * @returns The result of the resource.
 */
export type ResourceResolver<P, R, A extends Arguments> = (payload: P, ...args: A) => R;
