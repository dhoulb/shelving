import { RequestError } from "../error/RequestError.js";
import { type OptionalHandler, getRequestData } from "../util/http.js";
import { matchTemplate } from "../util/template.js";
import { getURL } from "../util/url.js";
import type { Resource, ResourceCallback } from "./Resource.js";

/**
 * Create a handler that matches an HTTP `Request` against a `Resource`, and returns a `Response` (possibly async) if the request matches, or `undefined` otherwise.
 *
 * @param resource A `Resource` instance that defines the method, path, and allowed types for the request.
 *
 * @param callback A callback function that will be called with the validated payload and should return the correct response type for the resource.
 * > @param payload is the parse body content of the request.
 * > - If the body is parsed as a `Data` object, also adds in path `{placeholders}` and `?query=` parameters in the URL.
 *
 * @returns An `OptionalHandler` that might handle a given `Request` if it matches the resource's method and path.
 * > @returns `undefined` if the request does not match the resource's method or path.
 * > @returns `Response` (possibly async) if the callback returns a valid response.
 * > @throws `RequestError` if the request matches but the payload from the request is invalid (this is an end user error in the request that needs to be reported back).
 * > @throws `ValueError` if the request matches but the value returned by the callback is invalid (this is more likely internal developer error that is reporting something wrong in the callback implementation).
 */
export function createResourceHandler<P, R>(resource: Resource<P, R>, callback: ResourceCallback<P, R>): OptionalHandler {
	return request => handleResourceRequest(request, resource, callback);
}

/**
 * Handle a `Request` to a `Resource` using a `ResourceCallback` that implements the logic for the resource.
 *
 * @param request The `Request` to handle, which may have a method and URL that match the resource's method and path.
 * @param resource A `Resource` instance that defines the method, path, and allowed types for the request.
 * @param callback A callback function that will be called with the validated payload and should return the correct response type for the resource.
 * > @param payload is the parse body content of the request.
 * > - If the body is parsed as a `Data` object, also adds in path `{placeholders}` and `?query=` parameters in the URL.
 *
 * @returns `undefined` if the request does not match the resource's method or path.
 * @returns `Response` (possibly async) if the callback returns a valid response.
 * @throws `Feedback` if the payload the client user provided is invalid. `Feedback` instances can be reported safely back to the end client so they know how to fix their request.
 * @throws `ValueError` if the request matches but the value returned by the callback is invalid (this is an internal error that is reporting something wrong in the callback implementation).
 */
export function handleResourceRequest<P, R>(
	request: Request,
	resource: Resource<P, R>,
	callback: ResourceCallback<P, R>,
): Response | Promise<Response> | undefined {
	// Ensure the request method e.g. `GET`, does not match the resource method e.g. `POST`
	if (request.method !== resource.method) return undefined;

	// Parse the URL of the request.
	const url = getURL(request.url);
	if (!url) throw new RequestError("Invalid request URL", { received: request.url, caller: handleResourceRequest });

	// Ensure the request URL e.g. `/user/123` matches the resource path e.g. `/user/{id}`
	// Any `{placeholders}` in the resource path are matched against the request URL to extract parameters.
	const params = matchTemplate(url.pathname, resource.path);
	if (!params) return undefined;

	// Extract a data object from the request body and validate it against the resource's payload type.
	const data = getRequestData(request);
	const payload = resource.prepare({ ...params, ...data });

	// Return the `Response` that results from calling the callback with the `Request` and the matching params.
	return _getHandlerResponse(resource, callback, payload, request);
}

/** Internal async function that calls `callback()` asyncronously and validates the result. */
async function _getHandlerResponse<P, R>(
	resource: Resource<P, R>,
	callback: ResourceCallback<P, R>,
	payload: P,
	request: Request,
): Promise<Response> {
	// Call the handler with the validated payload to get the result.
	const unsafeResult = await callback(payload, request);

	// Validate the result against the resource's result type.
	// Throw a `ValueError` if the result is not valid, which indicates an internal error in the callback implementation.
	const result = resource.validate(unsafeResult, _getHandlerResponse);

	// Return a new `Response` with a 200 status and the validated result data.
	return Response.json(result);
}
