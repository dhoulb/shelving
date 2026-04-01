import { MethodNotAllowedError, NotFoundError } from "../../error/RequestError.js";
import { ValueError } from "../../error/ValueError.js";
import { getDictionary } from "../../util/dictionary.js";
import type { AnyCaller, Arguments } from "../../util/function.js";
import { getRequestContent, getResponse, isRequestMethod, type RequestParams } from "../../util/http.js";
import { isPlainObject } from "../../util/object.js";
import type { AbsolutePath } from "../../util/path.js";
import { type PossibleURL, requireURL } from "../../util/url.js";
import type { Endpoint } from "./Endpoint.js";

/**
 * A function that handles an endpoint request, with a payload and returns a result.
 * - `payload` has already been validated against the endpoint payload schema before the callback is invoked.
 * - `request` is always the original incoming request object.
 */
export type EndpointCallback<P, R, A extends Arguments = []> = (
	payload: P,
	request: Request,
	...args: A
) => R | Response | Promise<R | Response>;

/** A typed endpoint definition paired with its implementation callback. */
export interface EndpointHandler<P = unknown, R = unknown, A extends Arguments = []> {
	readonly endpoint: Endpoint<P, R>;
	readonly callback: EndpointCallback<P, R, A>;
}

/** A collection of endpoint handlers that can be matched and invoked by `handleEndpoints()`. */
export type EndpointHandlers<A extends Arguments = []> = Iterable<EndpointHandler<unknown, unknown, A>>;

/**
 * Handle a `Request` with the first matching endpoint handler after stripping any base-path prefix from the request pathname.
 * - The original `Request` object is passed through to the callback unchanged.
 * - Path params and query params are merged before payload validation.
 * @param base The base URL for the API, e.g. `https://myapi.com/`
 */
export function handleEndpoints<A extends Arguments = []>(
	request: Request,
	base: PossibleURL,
	handlers: EndpointHandlers<A>,
	...args: A
): Promise<Response> {
	const caller = handleEndpoints;

	const { url, method } = request;
	if (!isRequestMethod(method)) throw new MethodNotAllowedError("Unsupported request method", { received: method, caller });

	const { origin: baseOrigin, pathname: basePath } = requireURL(base, undefined, caller);
	const { origin: requestOrigin, pathname: requestPath, searchParams } = requireURL(url, base, caller);

	if (baseOrigin !== requestOrigin)
		throw new NotFoundError("No matching origin", { expected: baseOrigin, received: requestOrigin, caller });

	const targetPath = _stripPathPrefix(requestPath, basePath, caller);

	for (const handler of handlers) {
		const pathParams = handler.endpoint.match(method, targetPath, caller);
		if (!pathParams) continue;
		const params = searchParams.size ? { ...getDictionary(searchParams), ...pathParams } : pathParams;
		return handleEndpoint(handler, params, request, args, handleEndpoints);
	}

	throw new NotFoundError("No matching endpoint", { received: targetPath, caller });
}

/**
 * Validate and invoke an endpoint callback after the routing layer has already matched URL params.
 */
async function handleEndpoint<P, R, A extends Arguments>(
	{ endpoint, callback }: EndpointHandler<P, R, A>,
	/** Params we already matched/parsed from the URL. */
	params: RequestParams,
	request: Request,
	args: A,
	caller: AnyCaller = handleEndpoint,
): Promise<Response> {
	const content = await getRequestContent(request, caller);
	const unsafePayload = content === undefined ? params : isPlainObject(content) ? { ...content, ...params } : content;

	const payload = endpoint.payload.validate(unsafePayload);
	const unsafeResult = await callback(payload, request, ...args);

	try {
		return getResponse(endpoint.result.validate(unsafeResult));
	} catch (thrown) {
		if (typeof thrown === "string")
			throw new ValueError(`Invalid result for ${endpoint.toString()}:\n${thrown}`, { endpoint, callback, cause: thrown, caller });
		throw thrown;
	}
}

/** Strip a prefix like `/a/b` from a path like `/a/b/c/d` to produce a remainder path like `/c/d`. */
function _stripPathPrefix(path: AbsolutePath, prefix: AbsolutePath, caller: AnyCaller): AbsolutePath {
	prefix = prefix === "/" ? "/" : (prefix.replace(/\/$/, "") as AbsolutePath);
	if (prefix === "/") return path;
	if (path === prefix) return "/";
	if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length) as AbsolutePath;
	throw new NotFoundError("No matching endpoint", { received: path, expected: prefix, caller });
}
