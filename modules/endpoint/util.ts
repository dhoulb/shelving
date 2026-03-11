import { NotFoundError, RequestError } from "../error/RequestError.js";
import type { AnyCaller, Arguments } from "../util/function.js";
import type { RequestHandler, RequestHandlers } from "../util/http.js";
import { getURL } from "../util/url.js";

/**
 * A function that handles a endpoint request, with a payload and returns a result.
 *
 * @param payload The payload of the request is the result of merging the `{placeholder}` path parameters and `?a=123` query parameters from the URL, with the body of the request.
 * - Payload is validated by the payload validator for the `Endpoint`.
 * - If the body of the `Request` is a data object (i.e. a plain object), then body data is merged with the path and query parameters to form a single flat object.
 * - If payload is _not_ a data object (i.e. it's another JSON type like `string` or `number`) then the payload is that raw body value.
 *
 * @param request The raw `Request` object in case it needs any additional processing.
 * @param args Additional arguments passed through `handleEndpoints()`.
 *
 * @returns The correct `Result` type for the `Endpoint`, or a raw `Response` object if you wish to return a custom response.
 */
export type EndpointCallback<P, R, A extends Arguments = []> = (
	payload: P,
	request: Request,
	...args: A
) => R | Response | Promise<R | Response>;

/**
 * List of endpoint handlers that can match and handle requests.
 */
export type EndpointHandlers<A extends Arguments = []> = ReadonlyArray<RequestHandler<A>>;

/**
 * Handle a `Request` with the first matching endpoint handler.
 *
 * 1. Define your `Endpoint` objects with a method, path, payload and result validators, e.g. `GET("/test/{id}", PAYLOAD, STRING)`.
 * 2. Make an array of endpoint handlers created via `endpoint.handler(callback)`.
 *
 * @returns The resulting `Response` from the first handler that matches the `Request`.
 * @throws `NotFoundError` if no handler matches the `Request`.
 */
export function handleEndpoints<A extends Arguments = []>(
	endpoints: RequestHandlers<A>,
	request: Request,
	...args: A
): Promise<Response> | Response {
	const caller: AnyCaller = handleEndpoints;

	// Parse the URL of the request.
	const url = getURL(request.url);
	if (!url) throw new RequestError("Invalid request URL", { received: request.url, caller });

	// Iterate over the handlers and return the first one that matches the request.
	for (const endpoint of endpoints) {
		const response = endpoint(request, ...args);
		if (response) return response;
	}

	// No handler matched the request.
	throw new NotFoundError("No matching endpoint", { received: request.url, caller });
}
