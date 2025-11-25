import { ResponseError } from "../error/ResponseError.js";
import { type Schema, UNDEFINED } from "../schema/Schema.js";
import { assertDictionary, type ImmutableDictionary } from "../util/dictionary.js";
import { getMessage } from "../util/error.js";
import type { AnyCaller } from "../util/function.js";
import { getResponse, getResponseContent } from "../util/http.js";
import type { AbsoluteLink } from "../util/link.js";
import { getPlaceholders, renderTemplate } from "../util/template.js";
import { omitURLParams, withURLParams } from "../util/url.js";
import { getValid } from "../util/validate.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

/** HTTP request methods. */
export type EndpointMethod = EndpointBodyMethod | EndpointHeadMethod;

/** HTTP request methods that have no body. */
export type EndpointHeadMethod = "HEAD" | "GET";

/** HTTP request methods that have a body. */
export type EndpointBodyMethod = "POST" | "PUT" | "PATCH" | "DELETE";

/** Configurable options for endpoint. */
export type EndpointOptions = Omit<RequestInit, "method" | "body">;

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions.
 *
 * @param method The method of the endpoint, e.g. `GET`
 * @param url Endpoint URL, possibly including placeholders e.g. `https://api.mysite.com/users/{id}`
 * @param payload A `Schema` for the payload of the endpoint.
 * @param result A `Schema` for the result of the endpoint.
 */
export class Endpoint<P, R> {
	/** Endpoint method. */
	readonly method: EndpointMethod;

	/** Endpoint URL, possibly including placeholders e.g. `https://api.mysite.com/users/{id}` */
	readonly url: AbsoluteLink;

	/** Payload schema. */
	readonly payload: Schema<P>;

	/** Result schema. */
	readonly result: Schema<R>;

	constructor(method: EndpointMethod, url: AbsoluteLink, payload: Schema<P>, result: Schema<R>) {
		this.method = method;
		this.url = url;
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Return an `EndpointHandler` for this endpoint.
	 *
	 * @param callback The callback function that implements the logic for this endpoint by receiving the payload and returning the response.
	 */
	handler(callback: EndpointCallback<P, R>): EndpointHandler<P, R> {
		return { endpoint: this, callback };
	}

	/**
	 * Handle a request to this endpoint with a callback implementation, with a given payload and request.
	 *
	 * @param callback The endpoint callback function that implements the logic for this endpoint by receiving the payload and returning the response.
	 * @param unsafePayload The payload to pass into the callback (will be validated against this endpoint's payload schema).
	 * @param request The entire HTTP request that is being handled (payload was possibly extracted from this somehow).
	 */
	async handle(callback: EndpointCallback<P, R>, unsafePayload: unknown, request: Request): Promise<Response> {
		// Validate the payload against this endpoint's payload type.
		const payload = this.payload.validate(unsafePayload);

		// Call the callback with the validated payload to get the result.
		const unsafeResult = await callback(payload, request);

		// Validate the result against this endpoint's result type.
		const result = getValid(unsafeResult, this.result);

		// Convert the result to a `Response` object.
		return getResponse(result);
	}

	/**
	 * Render the URL for this endpoint with the given payload.
	 * - URL mioght contain `{placeholder}` values that are replaced with values from the payload.
	 */
	renderURL(payload: P, caller: AnyCaller = this.renderURL): string {
		const { url } = this;

		// URL has `{placeholders}` to render.
		const placeholders = getPlaceholders(url);
		if (placeholders.length) {
			assertDictionary(payload, caller);
			return renderTemplate(url, payload, caller);
		}

		// URL has no `{placeholders}`
		return url;
	}

	/**
	 * Get an HTTP `Request` object for this endpoint.
	 * - Validates a payload against this endpoints payload schema
	 * - Return an HTTP `Request` that will send it the valid payload to this endpoint.
	 *
	 * @throws Feedback if the payload is invalid.
	 */
	request(payload: P, options: EndpointOptions = {}, caller: AnyCaller = this.request): Request {
		return createRequest(this.method, this.url, this.payload.validate(payload), options, caller);
	}

	/**
	 * Validate an HTTP `Response` against this endpoint.
	 * @throws ResponseError if the response status is not ok (200-299)
	 * @throws ResponseError if the response content is invalid.
	 */
	async response(response: Response, caller: AnyCaller = this.response): Promise<R> {
		// Get the response.
		const { ok, status } = response;
		const content = await getResponseContent(response, caller);

		// Throw `ResponseError` if the API returns status outside the 200-299 range.
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`);

		// Validate the success response.
		return getValid(content, this.result, ResponseError, caller);
	}

	/**
	 * Perform a fetch to this endpoint.
	 * - Validate the `payload` against this endpoint's payload schema.
	 * - Validate the returned response against this endpoint's result schema.
	 *
	 * @throws Feedback if the payload is invalid.
	 * @throws ResponseError if the response status is not ok (200-299)
	 * @throws ResponseError if the response content is invalid.
	 */
	async fetch(payload: P, options: EndpointOptions = {}, caller: AnyCaller = this.fetch): Promise<R> {
		const response = await fetch(this.request(payload, options, caller));
		return this.response(response, caller);
	}

	/** Convert to string, e.g. `GET https://a.com/user/{id}` */
	toString(): string {
		return `${this.method} ${this.url}`;
	}
}

/** Extract the payload type from a `Endpoint`. */
export type PayloadType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<infer Y, unknown> ? Y : never;

/** Extract the result type from a `Endpoint`. */
export type EndpointType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<unknown, infer Y> ? Y : never;

/**
 * Represent a GET request to a specified URL, with validated payload and return types.
 * "The GET method requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content."
 */
export function GET<P, R>(url: AbsoluteLink, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function GET<P>(url: AbsoluteLink, payload: Schema<P>): Endpoint<P, undefined>;
export function GET<R>(url: AbsoluteLink, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function GET(url: AbsoluteLink, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("GET", url, payload, result);
}

/**
 * Represent a POST request to a specified URL, with validated payload and return types.
 * "The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
 */
export function POST<P, R>(url: AbsoluteLink, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function POST<P>(url: AbsoluteLink, payload: Schema<P>): Endpoint<P, undefined>;
export function POST<R>(url: AbsoluteLink, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function POST(url: AbsoluteLink, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("POST", url, payload, result);
}

/**
 * Represent a PUT request to a specified URL, with validated payload and return types.
 * "The PUT method replaces all current representations of the target resource with the request content."
 */
export function PUT<P, R>(url: AbsoluteLink, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PUT<P>(url: AbsoluteLink, payload: Schema<P>): Endpoint<P, undefined>;
export function PUT<R>(url: AbsoluteLink, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PUT(url: AbsoluteLink, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PUT", url, payload, result);
}

/**
 * Represent a PATCH request to a specified URL, with validated payload and return types.
 * "The PATCH method applies partial modifications to a resource."
 */
export function PATCH<P, R>(url: AbsoluteLink, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PATCH<P>(url: AbsoluteLink, payload: Schema<P>): Endpoint<P, undefined>;
export function PATCH<R>(url: AbsoluteLink, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PATCH(url: AbsoluteLink, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PATCH", url, payload, result);
}

/**
 * Represent a DELETE request to a specified URL, with validated payload and return types.
 * "The DELETE method deletes the specified resource."
 */
export function DELETE<P, R>(url: AbsoluteLink, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function DELETE<P>(url: AbsoluteLink, payload: Schema<P>): Endpoint<P, undefined>;
export function DELETE<R>(url: AbsoluteLink, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function DELETE(url: AbsoluteLink, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("DELETE", url, payload, result);
}

/**
 * Create a `Request` instance for a method/url and payload.
 *
 * - If `{placeholders}` are set in the URL, they are replaced by values from payload (will throw if `payload` is not a dictionary object).
 * - If the method is `HEAD` or `GET`, the payload is sent as `?query` parameters in the URL.
 * - If the method is anything else, the payload is sent in the body (either as JSON, string, or `FormData`).
 *
 * @throws ValueError if this is a `HEAD` or `GET` request but `body` is not a dictionary object.
 * @throws ValueError if `{placeholders}` are set in the URL but `body` is not a dictionary object.
 */
function createRequest(
	method: EndpointMethod,
	url: string,
	payload: unknown,
	options: EndpointOptions = {},
	caller: AnyCaller = createRequest,
): Request {
	// This is a head request, so ensure the payload is a dictionary object.
	if (method === "GET" || method === "HEAD") {
		assertDictionary(payload, caller);
		return createHeadRequest(method, url, payload, options, caller);
	}

	// This is a normal body request.
	return createBodyRequest(method, url, payload, options, caller);
}

/**
 * Create a body-less request to a URL.
 * - Any `{placeholders}` in the URL will be rendered with values from `params`, and won't be set in `?query` parameters in the URL.
 */
function createHeadRequest(
	method: EndpointHeadMethod,
	url: string,
	params: ImmutableDictionary<unknown>,
	options: EndpointOptions = {},
	caller: AnyCaller = createHeadRequest,
): Request {
	const placeholders = getPlaceholders(url);

	// URL has `{placeholders}` to render, so rendere those to the URL and add all other params as `?query` params.
	if (placeholders.length) {
		const rendered = omitURLParams(withURLParams(renderTemplate(url, params, caller), params, caller), ...placeholders);
		return new Request(rendered, { ...options, method });
	}

	// URL has no `{placeholders}`, so add all payload params to the URL.
	return new Request(withURLParams(url, params, caller), { ...options, method });
}

/**
 * Create a body request to a URL.
 * - Any `{placeholders}` in the URL will be rendered with values from `data`, and won't be set in the request body.
 * - The payload is sent in the body (either as JSON, string, or `FormData`).
 *
 * @throws ValueError if `{placeholders}` are set in the URL but `body` is not a dictionary object.
 */
function createBodyRequest(
	method: EndpointBodyMethod,
	url: string,
	body: unknown,
	options: EndpointOptions = {},
	caller: AnyCaller = createBodyRequest,
): Request {
	const placeholders = getPlaceholders(url);

	// If `{placeholders}` are set in the URL then body must be a dictionary object and is sent as JSON.
	if (placeholders.length) {
		assertDictionary(body, caller);
		return createJSONRequest(method, url, body, options);
	}

	// `FormData` instances pass through unaltered and will set their own `Content-Type` with complex boundary information.
	if (body instanceof FormData) return createFormDataRequest(method, url, body, options);
	if (typeof body === "string") return createTextRequest(method, url, body, options);
	return createJSONRequest(method, url, body, options); // JSON is the default.
}

/** Create a `FormData` request to a URL. */
function createFormDataRequest(method: EndpointBodyMethod, url: string, body: FormData, options: EndpointOptions = {}): Request {
	return new Request(url, { ...options, method, body });
}

/** Create a plain text request to a URL. */
function createTextRequest(method: EndpointBodyMethod, url: string, body: string, { headers, ...options }: EndpointOptions = {}): Request {
	return new Request(url, { ...options, headers: { ...headers, "Content-Type": "text/plain" }, method, body });
}

/** Create a JSON request to a URL. */
function createJSONRequest(method: EndpointBodyMethod, url: string, body: unknown, { headers, ...options }: EndpointOptions = {}): Request {
	return new Request(url, { ...options, headers: { ...headers, "Content-Type": "application/json" }, method, body: JSON.stringify(body) });
}
