import { Dependencies } from "../array";
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
	resolve<D extends Dependencies>(resolver: ResourceResolver<P, unknown, D>, payload: unknown, ...deps: D): Promise<R>;
}

export type ResourcePayloadType<R extends Resource<unknown, unknown>> = ReturnType<R["payload"]["validate"]>;
export type ResourceResultType<R extends Resource<unknown, unknown>> = ReturnType<R["result"]["validate"]>;

/**
 * Function that resolves a resource by dispatching its payload and return its return type.
 * @param payload The payload for the resource.
 * @param deps Any additional arguments you want to pass into the resolver.
 * @param result THe result of the resource.
 */
export type ResourceResolver<P, R, D extends Dependencies> = (payload: P, ...deps: D) => R;
