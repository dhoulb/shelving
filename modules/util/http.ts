import type { AnyCaller } from "../error/BaseError.js";
import { NotFoundError, RequestError } from "../error/RequestError.js";
import { ResponseError } from "../error/ResponseError.js";
import type { ImmutableArray } from "./array.js";
import { type Data, getData, isData } from "./data.js";
import type { Optional } from "./optional.js";

/** A handler function takes a `Request` and returns a `Response` (possibly asynchronously). */
export type Handler = (request: Request) => Response | Promise<Response>;

/** An optional handler function _may_ match a `Request` and return a `Response`, or may return `undefined` if it doesn't match. */
export type OptionalHandler = (request: Request) => Optional<Response | Promise<Response>>;

/** A list of `OptionalHandler` functions that may match a `Request` */
export type Handlers = ImmutableArray<OptionalHandler>;

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

export async function _getMessageData(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<Data | undefined> {
	const data = await _getMessageJSON(message, MessageError, caller);
	if (isData(data) || data === undefined) return data;
	throw new MessageError("Body must be data object or undefined", { received: data, caller });
}

export async function _requireMessageData(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<Data> {
	const data = await _getMessageJSON(message, MessageError, caller);
	if (isData(data)) return data;
	throw new MessageError("Body must be data object", { received: data, caller });
}

export function _getMessageBody(
	message: Request | Response,
	MessageError: typeof RequestError | typeof ResponseError,
	caller: AnyCaller,
): Promise<unknown> {
	const type = message.headers.get("Content-Type");
	if (type?.startsWith("application/json")) return _getMessageJSON(message, MessageError, caller);
	if (type?.startsWith("text/plain")) return message.text();
	if (type?.startsWith("multipart/form-data")) return message.formData().then(getData);
	throw new MessageError("Unexpected content type", { received: type, caller });
}

/**
 * Parse the content of an HTTP `Request` based as JSON, or throw `RequestError` if the content could not be getd.
 *
 * @returns string (if the content type is `text/plain`)
 * @returns Data If the content can be parsed as a JSON object, or `undefined` if the content was empty.
 * @throws RequestError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getRequestJSON(message: Request): Promise<unknown> {
	return _getMessageJSON(message, RequestError, getRequestJSON);
}

/**
 * Parse the content of an HTTP `Response` based as JSON, or throw `ResponseError` if the content could not be getd.
 *
 * @returns string (if the content type is `text/plain`)
 * @returns Data If the content can be parsed as a JSON object, or `undefined` if the content was empty.
 * @throws ResponseError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getResponseJSON(message: Response): Promise<unknown> {
	return _getMessageJSON(message, ResponseError, getResponseJSON);
}

/**
 * Require the content of an HTTP `Request` as a data object in JSON format, or throw `RequestError` if the content cannot not be parsed or is not a data object in JSON format.
 *
 * @returns string (if the content type is `text/plain`)
 * @returns Data If the content can be parsed as a JSON object, or `undefined` if the content was empty.
 * @throws RequestError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getRequestData(message: Request): Promise<Data | undefined> {
	return _getMessageData(message, RequestError, getRequestData);
}

/**
 * Require the content of an HTTP `Response` as a data object in JSON format, or throw `ResponseError` if the content cannot not be parsed or is not a data object in JSON format.
 *
 * @returns string (if the content type is `text/plain`)
 * @returns Data If the content can be parsed as a JSON object, or `undefined` if the content was empty.
 * @throws ResponseError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getResponseData(message: Response): Promise<Data | undefined> {
	return _getMessageData(message, ResponseError, getResponseData);
}

/**
 * Require the content of an HTTP `Request` as a data object in JSON format, or throw `RequestError` if the content cannot not be parsed or is not a data object in JSON format.
 *
 * @returns string (if the content type is `text/plain`)
 * @returns Data If the content can be parsed as a JSON object, or `undefined` if the content was empty.
 * @throws RequestError if the content is not `application/json` with valid JSON that parses as a Data object.
 */
export function requireRequestData(message: Request): Promise<Data> {
	return _requireMessageData(message, RequestError, requireRequestData);
}

/**
 * Require the content of an HTTP `Response` as a data object in JSON format, or throw `ResponseError` if the content cannot not be parsed or is not a data object in JSON format.
 *
 * @returns string (if the content type is `text/plain`)
 * @returns Data If the content can be parsed as a JSON object, or `undefined` if the content was empty.
 * @throws ResponseError if the content is not `application/json` with valid JSON that parses as a Data object.
 */
export function requireResponseData(message: Response): Promise<Data> {
	return _requireMessageData(message, ResponseError, requireResponseData);
}

/**
 * Get the body content of an HTTP `Request` based on its content type, or throw `RequestError` if the content could not be parsed.
 *
 * @returns string If content type is `text/plain` (including empty string if it's empty).
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 *
 * @throws RequestError if the content is not `text/plain`, or `application/json` with valid JSON.
 */
export function getRequestBody(message: Request): Promise<unknown> {
	return _getMessageBody(message, RequestError, getRequestBody);
}

/**
 * Get the body content of an HTTP `Response` based on its content type, or throw `ResponseError` if the content could not be parsed.
 *
 * @returns string If content type is `text/plain` (including empty string if it's empty).
 * @returns unknown If content type is `application/json` and has valid JSON (including `undefined` if the content is empty).
 * @returns unknown If content type is `multipart/form-data` then convert it to a simple `Data` object.
 *
 * @throws RequestError if the content is not `text/plain` or `application/json` with valid JSON.
 */
export function getResponseBody(message: Response): Promise<unknown> {
	return _getMessageBody(message, ResponseError, getResponseBody);
}

/**
 * Handler a `Request` with the first matching `OptionalHandler` in a `Handlers` array.
 *
 * @returns The resulting `Response` from the first handler that matches the `Request`.
 * @throws `NotFoundError` if no handler matches the `Request`.
 */
export function handleRequest(request: Request, handlers: Handlers): Response | Promise<Response> {
	for (const handler of handlers) {
		const response = handler(request);
		if (response) return response;
	}
	throw new NotFoundError("Not found", { request, caller: handleRequest });
}
