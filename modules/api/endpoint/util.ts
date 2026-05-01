import { MethodNotAllowedError, NotFoundError } from "../../error/RequestError.js";
import { ValueError } from "../../error/ValueError.js";
import { requireDictionary } from "../../util/dictionary.js";
import type { AnyCaller } from "../../util/function.js";
import { getResponse, isRequestMethod, parseRequestBody, type RequestParams } from "../../util/http.js";
import { isPlainObject } from "../../util/object.js";
import { matchURLPrefix, type PossibleURL } from "../../util/url.js";

import type { Endpoint } from "./Endpoint.js";

/**
 * A function that handles an endpoint request, with a payload and returns a result.
 *
 * @param payload The payload for the callback combining the `{placeholders}`, `?search` params, and body content (this has been validated against the Endpoint's payload schema).
 * @param request The original incoming request object.
 * @param context An additional context argument that can be passed into the callback.
 *
 * @returns {Response} Returning a `Response` object (this will pass back to the client without validation).
 * @returns {R} Returning the return type of the handler (this will be validated against the Endpoint's result schema).
 */
export type EndpointCallback<P, R, C = void> = (payload: P, request: Request, context: C) => R | Response | Promise<R | Response>;

/** A typed endpoint definition paired with its implementation callback. */
export interface EndpointHandler<P, R, C = void> {
	readonly endpoint: Endpoint<P, R>;
	readonly callback: EndpointCallback<P, R, C>;
}

/** Any endpoint handler. */
// biome-ignore lint/suspicious/noExplicitAny: Intentional.
export type AnyEndpointHandler<C = any> = EndpointHandler<any, any, C>;

/** A collection of endpoint handlers that can be matched and invoked by `handleEndpoints()`. */
export type EndpointHandlers<C = void> = Iterable<AnyEndpointHandler<C>>;

/**
 * Handle a `Request` with the first matching endpoint handler after stripping any base-path prefix from the request pathname.
 * - The original `Request` object is passed through to the callback unchanged.
 * - Path params and query params are merged before payload validation.
 *
 * @param request The input request to handle.
 *
 * @param base The base URL for the API, e.g. `https://myapi.com/a/b`
 * - `pathname` of this URL gets trimmed from `request.path` to form the target path when matching against endpoints, e.g. `/a/b/c/d` will produce `/c/d` for matching.
 */
export function handleEndpoints<C>(
	base: PossibleURL,
	handlers: EndpointHandlers<C>,
	request: Request,
	context: C,
	caller?: AnyCaller,
): Promise<Response>;
export function handleEndpoints(
	base: PossibleURL,
	handlers: EndpointHandlers<void>,
	request: Request,
	context?: undefined,
	caller?: AnyCaller,
): Promise<Response>;
export function handleEndpoints<C>(
	base: PossibleURL,
	handlers: EndpointHandlers<C>,
	request: Request,
	context: C,
	caller: AnyCaller = handleEndpoints,
): Promise<Response> {
	const { url, method } = request;
	if (!isRequestMethod(method)) throw new MethodNotAllowedError("Unsupported request method", { received: method, caller });

	const { pathname: requestPath, searchParams } = new URL(url, base);
	const targetPath = matchURLPrefix(url, base);
	if (!targetPath) throw new NotFoundError("No matching base path", { received: requestPath, caller });

	for (const handler of handlers) {
		const pathParams = handler.endpoint.match(method, targetPath, caller);
		if (!pathParams) continue;
		const params = searchParams.size ? { ...requireDictionary(searchParams), ...pathParams } : pathParams;
		return _handleEndpoint(handler, params, request, context, handleEndpoints);
	}

	throw new NotFoundError("No matching endpoint", { received: targetPath, caller });
}

/**
 * Validate and invoke an endpoint callback after the routing layer has already matched URL params.
 */
async function _handleEndpoint<P, R, C>(
	{ endpoint, callback }: EndpointHandler<P, R, C>,
	/** Params we already matched/parsed from the URL. */
	params: RequestParams,
	request: Request,
	context: C,
	caller: AnyCaller,
): Promise<Response> {
	const content = await parseRequestBody(request, caller);
	const unsafePayload = content === undefined ? params : isPlainObject(content) ? { ...content, ...params } : content;

	const payload = endpoint.payload.validate(unsafePayload);
	const unsafeResult = await callback(payload, request, context);
	if (unsafeResult instanceof Response) return unsafeResult;

	try {
		return getResponse(endpoint.result.validate(unsafeResult));
	} catch (thrown) {
		if (typeof thrown === "string")
			throw new ValueError(`Invalid result for ${endpoint.toString()}:\n${thrown}`, { endpoint, callback, cause: thrown, caller });
		throw thrown;
	}
}
