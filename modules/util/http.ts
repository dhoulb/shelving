import { RequestError } from "../error/RequestError.js";
import { RequiredError } from "../error/RequiredError.js";
import { ResponseError } from "../error/ResponseError.js";
import { type Data, isData } from "./data.js";
import type { ImmutableDictionary } from "./dictionary.js";
import { isError } from "./error.js";
import type { AnyCaller, Arguments } from "./function.js";
import { isNullish, type Nullish } from "./null.js";
import { type PossibleURIParams, withURIParams } from "./uri.js";
import { type PossibleURL, requireURL } from "./url.js";
import { getXML } from "./xml.js";

/** A handler function takes a `Request` and optional extra arguments and returns a `Response` (possibly asynchronously). */
export type RequestHandler<A extends Arguments = []> = (request: Request, ...args: A) => Response | Promise<Response>;

/** An optional request handler that may return `undefined` to indicate no match. */
export type OptionalRequestHandler<A extends Arguments = []> = (request: Request, ...args: A) => Response | Promise<Response> | undefined;

/** A list of optional request handlers. */
export type OptionalRequestHandlers<A extends Arguments = []> = Iterable<OptionalRequestHandler<A>>;

/** Get parsed `JSON` from a `Request` or `Response`. */
async function _parseMessageJSON(
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

/** Get parsed `FormData` from a `Request` or `Response`. */
async function _parseMessageFormData(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<FormData> {
	try {
		return await message.formData();
	} catch (cause) {
		throw new MessageError(`Body must be valid form multipart data`, { cause, caller });
	}
}

/** Get parsed body from a `Request` or `Response`. */
function _parseMessageBody(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	const type = message.headers.get("Content-Type");
	if (type?.startsWith("text/")) return message.text();
	if (type?.startsWith("application/json")) return _parseMessageJSON(message, MessageError, caller);
	if (type?.startsWith("multipart/form-data")) return _parseMessageFormData(message, MessageError, caller);
	return Promise.resolve(undefined);
}

/**
 * Parse the body content of an HTTP `Request` based on its content type, or throw `RequestError` if the content could not be parsed.
 *
 * @returns undefined If the request method is `GET` or `HEAD` (these request methods have no body).
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 * @returns string If content type is `text/plain` or anything else (including `""` empty string if it's empty).
 *
 * @throws RequestError if the content is not `text/plain`, or `application/json` with valid JSON.
 */
export function parseRequestBody(request: Request, caller: AnyCaller = parseRequestBody): Promise<unknown> {
	return _parseMessageBody(request, RequestError, caller);
}

/**
 * Parse JSON from an HTTP `Request`, or return `undefined` when the request has no body.
 *
 * @throws RequestError If the request body is not valid JSON.
 */
export function parseRequestJSON(request: Request, caller: AnyCaller = parseRequestJSON): Promise<unknown> {
	return _parseMessageJSON(request, RequestError, caller);
}

/**
 * Parse `FormData` from an HTTP `Request`, or return `undefined` when the request has no body.
 *
 * @throws RequestError If the request body is not valid multipart form-data.
 */
export function parseRequestFormData(request: Request, caller: AnyCaller = parseRequestFormData): Promise<FormData | undefined> {
	return _parseMessageFormData(request, RequestError, caller);
}

/**
 * Parse the body content of an HTTP `Response` based on its content type, or throw `ResponseError` if the content could not be parsed.
 *
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 * @returns string If content type is `text/plain` or anything else (including `""` empty string if it's empty).
 *
 * @throws ResponseError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function parseResponseBody(response: Response, caller: AnyCaller = parseResponseBody): Promise<unknown> {
	return _parseMessageBody(response, ResponseError, caller);
}

/**
 * Parse JSON from an HTTP `Response`, or return `undefined` when the response has no body.
 *
 * @throws ResponseError If the response body is not valid JSON.
 */
export function parseResponseJSON(response: Response, caller: AnyCaller = parseResponseJSON): Promise<unknown> {
	return _parseMessageJSON(response, ResponseError, caller);
}

/**
 * Parse `FormData` from an HTTP `Response`, or return `undefined` when the response has no body.
 *
 * @throws ResponseError If the response body is not valid multipart form-data.
 */
export function parseResponseFormData(response: Response, caller: AnyCaller = parseResponseFormData): Promise<FormData> {
	return _parseMessageFormData(response, ResponseError, caller);
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

/** HTTP request methods that have no body. */
export type RequestHeadMethod = "HEAD" | "GET";

/** HTTP request methods that have a body. */
export type RequestBodyMethod = "POST" | "PUT" | "PATCH" | "DELETE";

/** HTTP request methods. */
export type RequestMethod = RequestHeadMethod | RequestBodyMethod;

// Method arrays.
const _REQUEST_HEAD_METHODS = ["HEAD", "GET"];
const _REQUEST_BODY_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const _REQUEST_METHODS = [..._REQUEST_HEAD_METHODS, ..._REQUEST_BODY_METHODS];

/** Check whether an HTTP Request method string is a supported request methods. */
export function isRequestMethod(method: string): method is RequestMethod {
	return _REQUEST_METHODS.includes(method);
}

/** Check whether an HTTP Request method string is a supported request method that never sends a body. */
export function isRequestHeadMethod(method: string): method is RequestHeadMethod {
	return _REQUEST_HEAD_METHODS.includes(method);
}

/** Params in requests are a dictionary of strings. */
export type RequestParams = ImmutableDictionary<string>;

/** Configurable options for endpoint requests. */
export type RequestOptions = Pick<
	RequestInit,
	"cache" | "credentials" | "headers" | "integrity" | "keepalive" | "mode" | "redirect" | "referrer" | "referrerPolicy" | "signal"
>;

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
 * Create a body-less `Request`.
 * - `HEAD` and `GET` requests never send a body.
 *
 * @param method The HTTP method.
 * @param url The target URL.
 * @param params `?query` params to encode into the URL.
 * @param options Additional request options.
 * @returns A `Request` with no body content.
 *
 * @example getHeadRequest("POST", "https://api.example.com/items", { name: "abc" })
 */
export function getHeadRequest(
	method: RequestHeadMethod,
	url: PossibleURL,
	params: Nullish<PossibleURIParams>,
	options: RequestOptions = {},
	caller: AnyCaller = getHeadRequest,
): Request {
	return new Request(withURIParams(requireURL(url, undefined, caller), params), { ...options, method, body: null });
}

/**
 * Create a plain-text `Request`.
 *
 * - `HEAD` and `GET` requests never send a body.
 *
 * @param method The HTTP method.
 * @param url The target URL.
 * @param body The plain-text request body.
 * @param options Additional request options.
 * @returns A `Request` with `text/plain` content type.
 *
 * @example getTextRequest("POST", "https://api.example.com/items", "hello")
 */
export function getTextRequest(
	method: RequestMethod,
	url: PossibleURL,
	body: string,
	options: RequestOptions = {},
	caller: AnyCaller = getTextRequest,
): Request {
	return new Request(requireURL(url, undefined, caller), { ...mergeRequestOptions(_REQUEST_TEXT_OPTIONS, options), method, body });
}
const _REQUEST_TEXT_OPTIONS = { headers: { "Content-Type": "text/plain" } };

/**
 * Create a JSON `Request`.
 * - `HEAD` and `GET` requests never send a body.
 * - If the JSON body is a data object for `HEAD` or `GET`, it is appended as `?query` params instead.
 *
 * @param method The HTTP method.
 * @param url The target URL.
 * @param body The value to JSON-encode.
 * @param options Additional request options.
 * @returns A `Request` with `application/json` content type.
 *
 * @example getJSONRequest("POST", "https://api.example.com/items", { name: "abc" })
 */
export function getJSONRequest(
	method: RequestBodyMethod,
	url: PossibleURL,
	body: unknown,
	options: RequestOptions = {},
	caller: AnyCaller = getJSONRequest,
): Request {
	return new Request(requireURL(url, undefined, caller), {
		...mergeRequestOptions(_REQUEST_JSON_OPTIONS, options),
		method,
		body: JSON.stringify(body),
	});
}
const _REQUEST_JSON_OPTIONS = { headers: { "Content-Type": "application/json" } };

/**
 * Create a multipart form-data `Request`.
 * - `HEAD` and `GET` requests never send a body.
 *
 * @param method The HTTP method.
 * @param url The target URL.
 * @param body The `FormData` payload.
 * @param options Additional request options.
 * @returns A `Request` with a multipart body.
 *
 * @example getFormDataRequest("POST", "https://api.example.com/upload", new FormData())
 */
export function getFormDataRequest(
	method: RequestBodyMethod,
	url: PossibleURL,
	body: FormData,
	options: RequestOptions = {},
	caller: AnyCaller = getFormDataRequest,
): Request {
	return new Request(requireURL(url, undefined, caller), { ...options, method, body });
}

/**
 * Create an XML `Request`.
 * - `HEAD` and `GET` requests never send a body.
 * - For `HEAD` and `GET`, the data object is appended as `?query` params instead.
 *
 * @param method The HTTP method.
 * @param url The target URL.
 * @param data The data object to serialize as XML.
 * @param options Additional request options.
 * @returns A `Request` with `application/xml` content type.
 *
 * @throws {RequiredError} If the XML data contains invalid element names or values.
 *
 * @example getXMLRequest("POST", "https://api.example.com/items", { item: { name: "abc" } })
 */
export function getXMLRequest(
	method: RequestBodyMethod,
	url: PossibleURL,
	data: Data,
	options: RequestOptions = {},
	caller: AnyCaller = getXMLRequest,
): Request {
	return new Request(requireURL(url, undefined, caller), {
		...mergeRequestOptions(_REQUEST_XML_OPTIONS, options),
		method,
		body: `<?xml version="1.0" encoding="UTF-8"?>${getXML(data, caller)}`,
	});
}
const _REQUEST_XML_OPTIONS = { headers: { "Content-Type": "application/xml; charset=UTF-8" } };

/**
 * Create a `Request` instance with a valid content type based on the body.
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
	if (isRequestHeadMethod(method)) {
		assertRequestHeadPayload(payload, method, caller);
		return new Request(withURIParams(url, payload), { ...options, method, body: null });
	}

	// `FormData` instances in body pass through unaltered and will set their own `Content-Type` with complex boundary information
	if (payload instanceof FormData) return getFormDataRequest(method, url, payload, options, caller);

	// Strings are sent as plain text.
	if (typeof payload === "string") return getTextRequest(method, url, payload, options, caller);

	// JSON is the default.
	return getJSONRequest(method, url, payload, options, caller);
}

/** Assert that the payload for a HEAD or GET method is a data object, null, or undefined. */
export function assertRequestHeadPayload(
	payload: unknown,
	method: RequestHeadMethod,
	caller: AnyCaller = assertRequestHeadPayload,
): asserts payload is Nullish<Data> {
	if (!isData(payload) && !isNullish(payload))
		throw new RequiredError(`Payload for ${method} request must be data object, null, or undefined`, { received: payload, caller });
}
