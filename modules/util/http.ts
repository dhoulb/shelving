import { RequestError } from "../error/RequestError.js";
import { RequiredError } from "../error/RequiredError.js";
import { ResponseError } from "../error/ResponseError.js";
import { isArrayItem } from "./array.js";
import { type Data, isData } from "./data.js";
import type { ImmutableDictionary } from "./dictionary.js";
import { isError } from "./error.js";
import type { AnyCaller, Arguments } from "./function.js";
import { isNullish, type Nullish } from "./null.js";
import { withURIParams } from "./uri.js";
import { type PossibleURL, requireURL } from "./url.js";

/** A handler function takes a `Request` and optional extra arguments and returns a `Response` (possibly asynchronously). */
export type RequestHandler<A extends Arguments = []> = (request: Request, ...args: A) => Response | Promise<Response>;

/** An optional request handler that may return `undefined` to indicate no match. */
export type OptionalRequestHandler<A extends Arguments = []> = (request: Request, ...args: A) => Response | Promise<Response> | undefined;

/** A list of optional request handlers. */
export type OptionalRequestHandlers<A extends Arguments = []> = Iterable<OptionalRequestHandler<A>>;

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

/** The set of supported HTTP methods that do not send a request body. */
export const HTTP_HEAD_METHODS = ["HEAD", "GET"] as const;

/** The set of supported HTTP methods that may send a request body. */
export const HTTP_BODY_METHODS = ["POST", "PUT", "PATCH", "DELETE"] as const;

/** The full set of supported HTTP methods. */
export const HTTP_METHODS = [...HTTP_HEAD_METHODS, ...HTTP_BODY_METHODS] as const;

/** HTTP request methods that have no body. */
export type RequestHeadMethod = (typeof HTTP_HEAD_METHODS)[number];

/** HTTP request methods that have a body. */
export type RequestBodyMethod = (typeof HTTP_BODY_METHODS)[number];

/** HTTP request methods. */
export type RequestMethod = (typeof HTTP_METHODS)[number];

/** Check whether an arbitrary method string is one of Shelving's supported request methods. */
export function isRequestMethod(method: string): method is RequestMethod {
	return (HTTP_METHODS as readonly string[]).includes(method);
}

/** Params in requests are a dictionary of strings. */
export type RequestParams = ImmutableDictionary<string>;

/** Configurable options for endpoint requests. */
export type RequestOptions = Pick<
	RequestInit,
	"cache" | "credentials" | "headers" | "integrity" | "keepalive" | "mode" | "redirect" | "referrer" | "referrerPolicy" | "signal"
>;

/** Options for a plain text request. */
const REQUEST_TEXT_OPTIONS = { headers: { "Content-Type": "text/plain" } };

/** Options for a JSON request. */
const REQUEST_JSON_OPTIONS = { headers: { "Content-Type": "application/json" } };

/**
 * Merge provider-level and call-level request options.
 * - Scalar options from `b` override `a`.
 * - Header dictionaries are merged so call-level headers override default headers by key.
 * - Abort signals are merged, so either abort signal will cancel the request.
 */
export function mergeRequestOptions(
	{ headers: aHeaders, signal: aSignal, ...a }: RequestOptions = {},
	{ headers: bHeaders, signal: bSignal, ...b }: RequestOptions = {},
): RequestOptions {
	const headers: HeadersInit = { ...aHeaders, ...bHeaders };
	const signal: AbortSignal | null = aSignal && bSignal ? AbortSignal.any([aSignal, bSignal]) : aSignal || bSignal || null;
	return { ...a, ...b, signal, headers };
}

/**
 * Create a `Request` instance with a valid content type based on the body.
 *
 * - `undefined` or `null` are sent with no body.
 * - `FormData` is sent with `multipart/formdata`
 * - `string` is sent with `text/plain` header.
 * - Anything else is sent as `application/json`
 * - Expects a fully valid URL (any `{placeholders}` in the URL are not considered).
 * - As per the HTTP spec, `GET` and `HEAD` requests cannot contain a body
 *
 * @returns Request object.
 *
 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `body` is not a data object.
 */
export function getRequest(
	method: RequestMethod,
	url: PossibleURL,
	payload: unknown,
	options: RequestOptions = {},
	caller: AnyCaller = getRequest,
): Request {
	url = requireURL(url, undefined, caller);

	// `null` or `undefined` payloads send no body.
	if (isNullish(payload)) return new Request(url, { ...options, method, body: null });

	// HEAD or GET have no body (but payload can only be data object).
	if (isArrayItem(HTTP_HEAD_METHODS, method)) {
		assertHeadMethodPayload(payload, method, caller);
		return new Request(withURIParams(url, payload), { ...options, method, body: null });
	}

	// `FormData` instances in body pass through unaltered and will set their own `Content-Type` with complex boundary information
	if (payload instanceof FormData) return new Request(url, { ...options, method, body: payload });

	// Strings are sent as plain text.
	if (typeof payload === "string")
		return new Request(url, { ...mergeRequestOptions(REQUEST_TEXT_OPTIONS, options), method, body: payload });

	// JSON is the default.
	return new Request(url, { ...mergeRequestOptions(REQUEST_JSON_OPTIONS, options), method, body: JSON.stringify(payload) });
}

/** Assert that the payload for a HEAD or GET method is a data object, null, or undefined. */
export function assertHeadMethodPayload(
	payload: unknown,
	method: RequestHeadMethod,
	caller: AnyCaller = assertHeadMethodPayload,
): asserts payload is Nullish<Data> {
	if (!isData(payload) && !isNullish(payload))
		throw new RequiredError(`Payload for ${method} request must be data object, null, or undefined`, { received: payload, caller });
}
