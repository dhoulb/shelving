import { ResponseError } from "../error/ResponseError.js";
import { type Schema, UNDEFINED } from "../schema/Schema.js";
import { assertData } from "../util/data.js";
import { assertDictionary } from "../util/dictionary.js";
import { getMessage } from "../util/error.js";
import type { AnyCaller } from "../util/function.js";
import { getResponse, getResponseContent } from "../util/http.js";
import type { AbsoluteLink } from "../util/link.js";
import { getPlaceholders, renderTemplate } from "../util/template.js";
import { omitURLParams, withURLParams } from "../util/url.js";
import { getValid } from "../util/validate.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

/** Types for an HTTP request or response that does something. */
export type EndpointMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

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
		if (placeholders) {
			assertData(payload, caller);
			return renderTemplate(url, payload, caller);
		}

		// URL has no `{placeholders}`
		return url;
	}

	/**
	 * Validate a payload against this endpoints payload schema, and return an HTTP `Request` that will send it to this endpoint.
	 */
	request(payload: P, options: RequestInit = {}, caller: AnyCaller = this.request): Request {
		const { url, method } = this;

		// Validate the payload — throws `Feedback` instances if validation fails.
		const body = this.payload.validate(payload);

		// Get requests have no body, so encode their payload as URL parameters or in the URL url.
		if (method === "GET") {
			assertDictionary(body, caller);
			const placeholders = getPlaceholders(url);

			// URL has `{placeholders}` to render, so rendere those to the URL and add all other params as `?query` params.
			if (placeholders) {
				const rendered = omitURLParams(withURLParams(renderTemplate(url, body, caller), body, caller), ...placeholders);
				return new Request(rendered, { method, ...options });
			}

			// URL has no `{placeholders}`, so add all payload params to the URL.
			return new Request(withURLParams(url, body, caller), { method, ...options });
		}

		// Text or `FormData` instances pass through and will set their own content type.
		if (typeof body === "string" || body instanceof FormData) return new Request(url, { method, ...options, body });

		// All other requests are converted to JSON.
		return new Request(url, {
			method,
			...options,
			headers: { ...options.headers, "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
	}

	/**
	 * Perform a fetch to this endpoint, and validate the returned response against this endpoint's result schema.
	 */
	async fetch(payload: P, options: RequestInit = {}, caller: AnyCaller = this.fetch): Promise<R> {
		// Fetch the response.
		const request = this.request(payload, options, caller);
		const response = await fetch(request);

		// Get the response.
		const { ok, status } = response;
		const content = await getResponseContent(response, caller);

		// Throw `ResponseError` if the API returns status outside the 200-299 range.
		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`);

		// Validate the success response.
		return getValid(content, this.result, ResponseError, caller);
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
