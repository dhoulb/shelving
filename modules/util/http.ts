import { RequestError } from "../error/RequestError.js";
import { ResponseError } from "../error/ResponseError.js";
import { Feedback } from "../feedback/Feedback.js";
import { getDictionary } from "./dictionary.js";
import { isError } from "./error.js";
import type { AnyCaller } from "./function.js";

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
	} catch {
		throw new MessageError("Body must be valid JSON", { received: trimmed, caller });
	}
}

export async function _getMessageFormData(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	try {
		return getDictionary(await message.formData());
	} catch {
		throw new MessageError("Body must be valid valid form multipart data", { caller });
	}
}

export function _getMessageContent(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	const type = message.headers.get("Content-Type");
	if (type?.startsWith("application/json")) return _getMessageJSON(message, MessageError, caller);
	if (type?.startsWith("multipart/form-data")) return _getMessageFormData(message, MessageError, caller);
	return message.text();
}

/**
 * Get the body content of an HTTP `Request` based on its content type, or throw `RequestError` if the content could not be parsed.
 *
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 * @returns string If content type is `text/plain` or anything else (including `""` empty string if it's empty).
 *
 * @throws RequestError if the content is not `text/plain`, or `application/json` with valid JSON.
 */
export function getRequestContent(message: Request, caller: AnyCaller = getRequestContent): Promise<unknown> {
	if (message.method === "GET" || message.method === "HEAD") return Promise.resolve(undefined);
	return _getMessageContent(message, RequestError, caller);
}

/**
 * Get the body content of an HTTP `Response` based on its content type, or throw `ResponseError` if the content could not be parsed.
 *
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 * @returns string If content type is `text/plain` or anything else (including `""` empty string if it's empty).
 *
 * @throws RequestError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getResponseContent(message: Response, caller: AnyCaller = getResponseContent): Promise<unknown> {
	return _getMessageContent(message, ResponseError, caller);
}

/**
 * Get the body content of an HTTP `Request` as JSON, or throw `RequestError` if the content could not be parsed.
 * - Doesn't check the `Content-Type` header, so it can be used for any request.
 *
 * @returns unknown The parsed JSON content of the request body, or `undefined` if the body is empty.
 *
 * @throws RequestError if the content is not valid JSON.
 */
export function getRequestJSON(message: Request, caller: AnyCaller = getRequestJSON): Promise<unknown> {
	return _getMessageJSON(message, RequestError, caller);
}

/**
 * Get the body content of an HTTP `Response` as JSON, or throw `ResponseError` if the content could not be parsed.
 * - Doesn't check the `Content-Type` header, so it can be used for any response.
 *
 * @returns unknown The parsed JSON content of the response body, or `undefined` if the body is empty.
 *
 * @throws RequestError if the content is not valid JSON.
 */
export function getResponseJSON(message: Response, caller: AnyCaller = getResponseJSON): Promise<unknown> {
	return _getMessageJSON(message, ResponseError, caller);
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
 * - If `reason` is a `Feedback` instance, return a 400 response with the feedback's message as JSON, e.g. `{ message: "Invalid input" }`
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

	// Throw 'Feedback' to return `{ message: "etc" }` to the client, e.g. for input validation.
	if (reason instanceof Feedback) return Response.json(reason, { status: 422 }); // HTTP 422 Unprocessable Entity

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
