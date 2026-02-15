import { ResponseError } from "../error/ResponseError.js";
import { ValueError } from "../error/ValueError.js";
import { type Schema, UNDEFINED } from "../schema/Schema.js";
import { assertDictionary } from "../util/dictionary.js";
import { getMessage } from "../util/error.js";
import type { AnyCaller } from "../util/function.js";
import { getRequest, getResponse, getResponseContent, type RequestMethod, type RequestOptions } from "../util/http.js";
import { getPlaceholders, renderTemplate } from "../util/template.js";
import type { URLString } from "../util/url.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

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
	readonly method: RequestMethod;

	/** Endpoint URL, possibly including placeholders e.g. `https://api.mysite.com/users/{id}` */
	readonly url: URLString;

	/** Payload schema. */
	readonly payload: Schema<P>;

	/** Result schema. */
	readonly result: Schema<R>;

	constructor(method: RequestMethod, url: URLString, payload: Schema<P>, result: Schema<R>) {
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
	 *
	 * @throws `string` if the payload is invalid.
	 * @throws `ValueError` if `callback()` returns an invalid result.
	 */
	async handle(
		callback: EndpointCallback<P, R>,
		unsafePayload: unknown,
		request: Request,
		caller: AnyCaller = this.handle,
	): Promise<Response> {
		// Validate the payload against this endpoint's payload type.
		const payload = this.payload.validate(unsafePayload);

		// Call the callback with the validated payload to get the result.
		const unsafeResult = await callback(payload, request);

		try {
			// Convert the result to a `Response` object.
			return getResponse(this.result.validate(unsafeResult));
		} catch (thrown) {
			if (typeof thrown === "string")
				throw new ValueError(`Invalid result for ${this.toString()}:\n${thrown}`, {
					endpoint: this,
					callback,
					cause: thrown,
					caller,
				});
			throw thrown;
		}
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
	 * @throws `string` if the payload is invalid.
	 */
	request(payload: P, options: RequestOptions = {}, caller: AnyCaller = this.request): Request {
		return getRequest(this.method, this.url, this.payload.validate(payload), options, caller);
	}

	/**
	 * Validate an HTTP `Response` against this endpoint.
	 *
	 * @throws `ResponseError` if the response status is not ok (200-299)
	 * @throws `ResponseError` if the response content is invalid.
	 */
	async response(response: Response, caller: AnyCaller = this.response): Promise<R> {
		// Get the response.
		const { ok, status } = response;
		const content = await getResponseContent(response, caller);

		// Throw `ResponseError` if the API returns status outside the 200-299 range.
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`, { code: status, cause: response, caller });

		// Validate the success response.
		try {
			return this.result.validate(content);
		} catch (thrown) {
			if (typeof thrown === "string")
				throw new ResponseError(`Invalid result for ${this.toString()}:\n${thrown}`, { endpoint: this, code: 422, caller });
			throw thrown;
		}
	}

	/**
	 * Perform a fetch to this endpoint.
	 * - Validate the `payload` against this endpoint's payload schema.
	 * - Validate the returned response against this endpoint's result schema.
	 *
	 * @throws `string` if the payload is invalid.
	 * @throws `ResponseError` if the response status is not ok (200-299)
	 * @throws `ResponseError` if the response content is invalid.
	 */
	async fetch(payload: P, options: RequestOptions = {}, caller: AnyCaller = this.fetch): Promise<R> {
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
export function GET<P, R>(url: URLString, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function GET<P>(url: URLString, payload: Schema<P>): Endpoint<P, undefined>;
export function GET<R>(url: URLString, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function GET(url: URLString, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("GET", url, payload, result);
}

/**
 * Represent a POST request to a specified URL, with validated payload and return types.
 * "The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
 */
export function POST<P, R>(url: URLString, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function POST<P>(url: URLString, payload: Schema<P>): Endpoint<P, undefined>;
export function POST<R>(url: URLString, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function POST(url: URLString, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("POST", url, payload, result);
}

/**
 * Represent a PUT request to a specified URL, with validated payload and return types.
 * "The PUT method replaces all current representations of the target resource with the request content."
 */
export function PUT<P, R>(url: URLString, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PUT<P>(url: URLString, payload: Schema<P>): Endpoint<P, undefined>;
export function PUT<R>(url: URLString, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PUT(url: URLString, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PUT", url, payload, result);
}

/**
 * Represent a PATCH request to a specified URL, with validated payload and return types.
 * "The PATCH method applies partial modifications to a resource."
 */
export function PATCH<P, R>(url: URLString, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PATCH<P>(url: URLString, payload: Schema<P>): Endpoint<P, undefined>;
export function PATCH<R>(url: URLString, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PATCH(url: URLString, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PATCH", url, payload, result);
}

/**
 * Represent a DELETE request to a specified URL, with validated payload and return types.
 * "The DELETE method deletes the specified resource."
 */
export function DELETE<P, R>(url: URLString, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function DELETE<P>(url: URLString, payload: Schema<P>): Endpoint<P, undefined>;
export function DELETE<R>(url: URLString, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function DELETE(url: URLString, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("DELETE", url, payload, result);
}
