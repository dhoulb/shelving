import { RequestError } from "../error/RequestError.js";
import { RequiredError } from "../error/RequiredError.js";
import { ResponseError } from "../error/ResponseError.js";
import { type Data, isData } from "./data.js";
import { isError } from "./error.js";
import type { AnyCaller } from "./function.js";
import { omitProps } from "./object.js";
import { getPlaceholders, renderTemplate } from "./template.js";
import { withURIParams } from "./uri.js";
import type { URLString } from "./url.js";

/** A handler function takes a `Request` and returns a `Response` (possibly asynchronously). */
export type RequestHandler = (request: Request) => Response | Promise<Response>;

export async function _getMessageJSON(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	const trimmed = (await message.text()).trim();
	if (!trimmed.length) return undefined;
	try {
		return JSON.parse(trimmed);
	} catch (cause) {
		throw new MessageError("Body must be valid JSON", { received: trimmed, cause, caller });
	}
}

export async function _getMessageFormData(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	try {
		return await message.formData();
	} catch (cause) {
		throw new MessageError(`Body must be valid form multipart data`, { cause, caller });
	}
}

export function _getMessageContent(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	const type = message.headers.get("Content-Type");
	if (!type || type?.startsWith("text/")) return message.text();
	if (type?.startsWith("application/json")) return _getMessageJSON(message, MessageError, caller);
	if (type?.startsWith("multipart/form-data")) return _getMessageFormData(message, MessageError, caller);
	return Promise.resolve();
}

/**
 * Get the body content of an HTTP `Request` based on its content type, or throw `RequestError` if the content could not be parsed.
 *
 * @returns undefined If the request method is `GET` or `HEAD` (these request methods have no body).
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 * @returns string If content type is `text/plain` or anything else (including `""` empty string if it's empty).
 *
 * @throws RequestError if the content is not `text/plain`, or `application/json` with valid JSON.
 */
export function getRequestContent(request: Request, caller: AnyCaller = getRequestContent): Promise<unknown> {
	const { method } = request;

	// The HTTP/1.1 RFC 7231 does not forbid sending a body in GET or HEAD requests, but it is uncommon and not recommended because many servers, proxies, and caches may ignore or mishandle it.
	if (method === "GET" || method === "HEAD") return Promise.resolve(undefined);

	return _getMessageContent(request, RequestError, caller);
}

/**
 * Get the body content of an HTTP `Response` based on its content type, or throw `ResponseError` if the content could not be parsed.
 *
 * @returns undefined If the request status is `204 No Content` (this response has no body).
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 * @returns string If content type is `text/plain` or anything else (including `""` empty string if it's empty).
 *
 * @throws RequestError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getResponseContent(response: Response, caller: AnyCaller = getResponseContent): Promise<unknown> {
	const { status } = response;

	// RFC 7230 Section 3.3.3: A server MUST NOT send a Content-Length header field in any response with a status code of 1xx (Informational), 204 (No Content), or 304 (Not Modified).
	if ((status >= 100 && status < 200) || status === 204 || status === 304) return Promise.resolve(undefined);

	return _getMessageContent(response, ResponseError, caller);
}

/**
 * Get an HTTP `Response` for an unknown value.
 *
 * @param value The value to convert to a `Response`.
 * @returns A `Response` with a 2xx status, and response body as JSON (if it was set), or no body if `value` is `undefined`
 */
export function getResponse(value: unknown): Response {
	// If it's already a `Response`, return it directly.
	if (value instanceof Response) return value;

	// If result is undefined, return 204 No Content response.
	if (value === undefined) return new Response(undefined, { status: 204 });

	// Return a new `Response` with a 2xx status and response body as JSON.
	return Response.json(value, { status: 200 });
}

/**
 * Get an HTTP `Response` for an unknown error value.
 *
 * Returns the correct `Response` based on the type of error thrown:
 * - If `reason` is a `Response` instance, return it directly.
 * - If `reason` is a string, return a 422 response with the string message, e.g. `"Invalid input"`
 * - If `reason` is an `RequestError` instance, return a response with the error's message and code (but only if `debug` is true so we don't leak error details to the client).
 * - If `reason` is an `Error` instance, return a 500 response with the error's message (but only if `debug` is true so we don't leak error details to the client).
 * - Anything else returns a 500 response.
 *
 * @param reason The error value to convert to a `Response`.
 * @param debug If `true` include the error message in the response (for debugging), or `false` to return generic error codes (for security).
 */
export function getErrorResponse(reason: unknown, debug = false): Response {
	// If it's already a `Response`, return it directly.
	if (reason instanceof Response) return reason;

	// Throw validation message strings to return `{ message: "etc" }` to the client.
	if (typeof reason === "string") return new Response(reason, { status: 422 }); // HTTP 422 Unprocessable Entity

	// Throw `RequestError` to set a custom status code (e.g. `UnauthorizedError`).
	const status = reason instanceof RequestError ? reason.code : 500;

	// Throw `Error` to return `{ message: "etc" }` to the client (but only if `debug` is true so we don't leak error details to the client).
	if (debug && isError(reason)) {
		// Manually destructure because `message` and `cause` on `Error` are not enumerable.
		const { message, cause, ...rest } = reason;
		return Response.json({ message, cause, ...rest }, { status });
	}

	// Otherwise return a generic error message with no details.
	return new Response(undefined, { status });
}

/** HTTP request methods. */
export type RequestMethod = RequestBodyMethod | RequestHeadMethod;

/** HTTP request methods that have no body. */
export type RequestHeadMethod = "HEAD" | "GET";

/** HTTP request methods that have a body. */
export type RequestBodyMethod = "POST" | "PUT" | "PATCH" | "DELETE";

/** Configurable options for endpoint. */
export type RequestOptions = Omit<RequestInit, "method" | "body">;

/**
 * Create a `Request` instance for a method/url and payload.
 *
 * - If `{placeholders}` are set in the URL, they are replaced by values from payload (will throw if `payload` is not a data object).
 * - If the method is `HEAD` or `GET`, the payload is sent as `?query` parameters in the URL.
 * - If the method is anything else, the payload is sent in the body (plain text string, `FormData` object, or JSON for any other).
 *
 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
 * @throws {RequiredError} if `{placeholders}` are set in the URL but `payload` is not a data object.
 */
export function getRequest(method: RequestHeadMethod, url: URLString, payload: Data, options?: RequestOptions, caller?: AnyCaller): Request;
export function getRequest(method: RequestMethod, url: URLString, payload: unknown, options?: RequestOptions, caller?: AnyCaller): Request;
export function getRequest(
	method: RequestMethod,
	url: URLString,
	payload: unknown,
	options: RequestOptions = {},
	caller: AnyCaller = getRequest,
): Request {
	// Render any `{placeholders}` in the URL string.
	const placeholders = getPlaceholders(url);
	if (placeholders.length) {
		if (!isData(payload))
			throw new RequiredError("Payload for request with URL {placeholders} must be data object", { received: payload, caller });
		url = renderTemplate(url, payload, caller) as URLString;
		payload = omitProps(payload, ...placeholders);
	}

	// This is a body-less request, so ensure the payload is a data object and set the `?query=params` in the URL.
	if (method === "GET" || method === "HEAD") {
		if (!isData(payload)) throw new RequiredError(`Payload for ${method} request must be data object`, { received: payload, caller });
		return new Request(withURIParams(url, payload), { ...options, method });
	}

	// `FormData` instances in body pass through unaltered and will set their own `Content-Type` with complex boundary information
	if (payload instanceof FormData) return new Request(url);

	// Strings are sent as plain text.
	if (typeof payload === "string")
		return new Request(url, {
			...options,
			headers: { ...options.headers, "Content-Type": "text/plain" },
			method,
			body: payload,
		});

	// JSON is the default.
	return new Request(url, {
		...options,
		headers: { ...options.headers, "Content-Type": "application/json" },
		method,
		body: JSON.stringify(payload),
	});
}
