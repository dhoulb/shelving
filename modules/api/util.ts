import { NotFoundError, RequestError } from "../error/RequestError.js";
import { Feedback } from "../feedback/Feedback.js";
import { isData } from "../util/data.js";
import { type ImmutableDictionary, getDictionary } from "../util/dictionary.js";
import { isError } from "../util/error.js";
import { getRequestContent } from "../util/http.js";
import { matchTemplate } from "../util/template.js";
import { getURL } from "../util/url.js";
import type { Endpoint } from "./Endpoint.js";

/**
 * A function that handles a endpoint request, with a payload and returns a result.
 *
 * @param payload The payload of the request is the result of merging the `{placeholder}` path parameters and `?a=123` query parameters from the URL, with the body of the request.
 * - Payload is validated by the payload validator for the `Endpoint`.
 * - If the body of the `Request` is a data object (i.e. a plain object), then body data is merged with the path and query parameters to form a single flat object.
 * - If payload is _not_ a data object (i.e. it's another JSON type like `string` or `number`) then the payload include the path and query parameters, and a key called `content` that contains the body of the request.
 *
 * @param request The raw `Request` object in case it needs any additional processing.
 *
 * @returns The correct `Result` type for the `Endpoint`, or a raw `Response` object if you wish to return a custom response.
 */
export type EndpointCallback<P, R> = (payload: P, request: Request) => R | Response | Promise<R | Response>;

/**
 * Object combining an abstract `Endpoint` and an `EndpointCallback` implementation.
 */
export interface EndpointHandler<P, R> {
	readonly endpoint: Endpoint<P, R>;
	readonly callback: EndpointCallback<P, R>;
}

/**
 * Any handler (purposefully as wide as possible for use with `extends X` or `is X` statements).
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AnyEndpointHandler = EndpointHandler<any, any>;

/**
 * List of `EndpointHandler` objects objects that can handle requests to an `Endpoint`.
 */
export type EndpointHandlers = ReadonlyArray<AnyEndpointHandler>;

/**
 * Handler a `Request` with the first matching `EndpointHandlers`.
 *
 * 1. Define your `Endpoint` objects with a method, path, payload and result validators, e.g. `GET("/test/{id}", PAYLOAD, STRING)`
 * 2. Make an array of `EndpointHandler` objects combining an `Endpoint` with a `callback` function
 * -
 *
 * @returns The resulting `Response` from the first handler that matches the `Request`.
 * @throws `NotFoundError` if no handler matches the `Request`.
 */
export function handleEndpoints(request: Request, endpoints: EndpointHandlers): Promise<Response> {
	// Parse the URL of the request.
	const requestUrl = request.url;
	const url = getURL(requestUrl);
	if (!url) throw new RequestError("Invalid request URL", { received: requestUrl, caller: handleEndpoints });
	const { pathname, searchParams } = url;

	// Iterate over the handlers and return the first one that matches the request.
	for (const { endpoint, callback } of endpoints) {
		// Ensure the request method e.g. `GET`, does not match the endpoint method e.g. `POST`
		if (request.method !== endpoint.method) continue;

		// Ensure the request URL e.g. `/user/123` matches the endpoint path e.g. `/user/{id}`
		// Any `{placeholders}` in the endpoint path are matched against the request URL to extract parameters.
		const pathParams = matchTemplate(endpoint.path, pathname, handleEndpoints);
		if (!pathParams) continue;

		// Make a simple dictionary object from the `{placeholder}` path params and the `?a=123` query params from the URL.
		const params: ImmutableDictionary<string> = searchParams.size ? { ...getDictionary(searchParams), ...pathParams } : pathParams;

		// Get the response by calling the callback.
		return handleEndpoint(endpoint, callback, params, request);
	}

	// No handler matched the request.
	throw new NotFoundError("No matching endpoint", { received: requestUrl, caller: handleEndpoints });
}

/** Handle an individual call to an endpoint callback. */
async function handleEndpoint<P, R>(
	endpoint: Endpoint<P, R>,
	callback: EndpointCallback<P, R>,
	params: ImmutableDictionary<string>,
	request: Request,
): Promise<Response> {
	// Extract a data object from the request body and validate it against the endpoint's payload type.
	const content = await getRequestContent(request, handleEndpoints);

	// If content is undefined, it means the request has no body, so params are the only payload.
	// If the content is a data object merge if with the params.
	// If the content is not a data object (e.g. string, number, array), set a single `content` property and merge it with the params.
	const payload = content === undefined ? params : isData(content) ? { ...content, ...params } : { content, ...params };

	// Call `endpoint.handle()` with the payload and request.
	return endpoint.handle(callback, payload, request);
}

/**
 * Correctly interpret an error thrown from an endpoint and return the correct `Response`.
 *
 * Returns the correct `Response` based on the type of error thrown:
 * - If `reason` is a `Response` instance, return it directly.
 * - If `reason` is a `Feedback` instance, return a 400 response with the feedback's message as JSON, e.g. `{ message: "Invalid input" }`
 * - If `reason` is an `RequestError` instance, return a response with the error's message and code (but only if `debug` is true so we don't leak error details to the client).
 * - If `reason` is an `Error` instance, return a 500 response with the error's message (but only if `debug` is true so we don't leak error details to the client).
 * - Anything else returns a 500 response.
 *
 * @param reason The error thrown from the endpoint.
 * @param debug If `true` include the error message in the response (for debugging), or `false` to return generic error codes (for security).
 */
export function handleEndpointError(reason: unknown, debug = false): Response {
	// Throw `Response` to do a custom response that is not logged.
	if (reason instanceof Response) return reason;

	// Throw 'Feedback' to return `{ message: "etc" }` to the client, e.g. for input validation.
	if (reason instanceof Feedback) return Response.json(reason, { status: 422 }); // HTTP 422 Unprocessable Entity

	// Throw `RequestError` to set a custom status code (e.g. `UnauthorizedError`).
	const status = reason instanceof RequestError ? reason.code : 500;

	// Throw `Error` to return `{ message: "etc" }` to the client (but only if `debug` is true so we don't leak error details to the client).
	if (debug && isError(reason)) return Response.json(reason, { status });

	// Otherwise return a generic error message.
	return new Response(undefined, { status });
}
