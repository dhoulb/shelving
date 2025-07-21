import { RequestError } from "../error/RequestError.js";
import { ResponseError } from "../error/ResponseError.js";
import { getDictionary } from "./dictionary.js";
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
	if (type?.startsWith("text/plain")) return message.text();
	if (type?.startsWith("application/json")) return _getMessageJSON(message, MessageError, caller);
	if (type?.startsWith("multipart/form-data")) return _getMessageFormData(message, MessageError, caller);
	throw new MessageError("Unexpected content type", { received: type, caller });
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
export function getRequestContent(message: Request, caller: AnyCaller = getRequestContent): Promise<unknown> {
	if (message.method === "GET" || message.method === "HEAD") return Promise.resolve(undefined);
	return _getMessageContent(message, RequestError, caller);
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
export function getResponseContent(message: Response, caller: AnyCaller = getResponseContent): Promise<unknown> {
	return _getMessageContent(message, ResponseError, caller);
}
