import { Dependencies } from "../array";
import { Resource } from "./Resource";

/** Function that dispatches the payload to the resource. */
type ResourceFetcher<P, R, D extends Dependencies> = (payload: P, ...deps: D) => R | unknown;

/**
 * Call a resource with a given payload.
 * - Validate the payload (before the resource function is called).
 * - Validate the result (after the resource function is called).
 * - Accepts additional dependencies which are also passed into the dispatcher function.
 */
export const callResource = async <P, R, D extends Dependencies>(
	resource: Resource<P, R>,
	fetcher: ResourceFetcher<P, R, D>,
	payload: unknown,
	...deps: D
): Promise<R> => resource.result.validate(await fetcher(resource.payload.validate(payload), ...deps));
