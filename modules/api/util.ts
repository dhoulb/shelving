import { NotFoundError, RequestError } from "../error/RequestError.js";
import { ValueError } from "../error/ValueError.js";
import { isData } from "../util/data.js";
import { type ImmutableDictionary, getDictionary } from "../util/dictionary.js";
import { getRequestContent } from "../util/http.js";
import { matchTemplate } from "../util/template.js";
import { getURL } from "../util/url.js";
import { getValid } from "../util/validate.js";
import type { Endpoint } from "./Endpoint.js";

/**
 * A function that handles a endpoint request, with a payload and returns a result.
 *
 * @param payload The payload of the request is the result of merging the `{placeholder}` path parameters and `?a=123` query parameters from the URL, with the body of the request.
 * - Payload is validated by the payload validator for the `Endpoint`.
 * - If the body of the `Request` is a data object (i.e. a plain object), then body data is merged with the path and query parameters to form a single flat object.
 * - If payload is _not_ a data object (i.e. it's another JSON type like `string` or `number`) then the payload include the path and query parameters, and a key called `content` that contains the body of the request.
 */
export type EndpointCallback<P, R> = (payload: P, request: Request) => R | Promise<R>;

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
 * Handler a `Request` with the first matching `OptionalHandler` in a `Handlers` array.
 *
 * @returns The resulting `Response` from the first handler that matches the `Request`.
 * @throws `NotFoundError` if no handler matches the `Request`.
 */
export function handleEndpoints(request: Request, endpoints: EndpointHandlers) {
	// Parse the URL of the request.
	const url = getURL(request.url);
	if (!url) throw new RequestError("Invalid request URL", { received: request.url, caller: handleEndpoints });
	const { pathname, searchParams } = url;

	// Iterate over the handlers and return the first one that matches the request.
	for (const { endpoint, callback } of endpoints) {
		// Ensure the request method e.g. `GET`, does not match the endpoint method e.g. `POST`
		if (request.method !== endpoint.method) continue;

		// Ensure the request URL e.g. `/user/123` matches the endpoint path e.g. `/user/{id}`
		// Any `{placeholders}` in the endpoint path are matched against the request URL to extract parameters.
		const pathParams = matchTemplate(endpoint.path, pathname, handleEndpoints);
		if (!pathParams) continue;

		// Merge the search params and path params.
		const params: ImmutableDictionary<string> = searchParams.size ? { ...getDictionary(searchParams), ...pathParams } : pathParams;

		// Get the response by calling the callback.
		return _getResponse(endpoint, callback, params, request);
	}
	throw new NotFoundError("Not found", { request, caller: handleEndpoints });
}

async function _getResponse<P, R>(
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
	const unsafePayload = content === undefined ? params : isData(content) ? { ...content, ...params } : { content, ...params };
	const payload = endpoint.prepare(unsafePayload);

	// Call the handler with the validated payload to get the result.
	const unsafeResult = await callback(payload, request);

	// Validate the result against the endpoint's result type.
	// Throw a `ValueError` if the result is not valid, which indicates an internal error in the callback implementation.
	const result = getValid(unsafeResult, endpoint, ValueError, handleEndpoints);

	// Return a new `Response` with a 200 status and the validated result data.
	return Response.json(result);
}
