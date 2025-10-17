import { type Schema, UNDEFINED } from "../schema/Schema.js";
import { getResponse } from "../util/http.js";
import type { AbsolutePath } from "../util/path.js";
import { getValid } from "../util/validate.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

/** Types for an HTTP request or response that does something. */
export type EndpointMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions.
 *
 * @param method The method of the resource, e.g. `GET`
 * @param path The path of the resource optionally including `{placeholder}` values, e.g. `/patient/{id}`
 * @param payload A `Schema` for the payload of the resource.
 * @param result A `Schema` for the result of the resource.
 */
export class Endpoint<P, R> {
	/** Endpoint method. */
	readonly method: EndpointMethod;

	/** Endpoint path, e.g. `/patient/{id}` */
	readonly path: AbsolutePath;

	/** Payload validator. */
	readonly payload: Schema<P>;

	/** Result validator. */
	readonly result: Schema<R>;

	constructor(method: EndpointMethod, path: AbsolutePath, payload: Schema<P>, result: Schema<R>) {
		this.method = method;
		this.path = path;
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

	/** Convert to string, e.g. `GET /user/{id}` */
	toString(): string {
		return `${this.method} ${this.path}`;
	}
}

/** Extract the payload type from a `Endpoint`. */
export type PayloadType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<infer Y, unknown> ? Y : never;

/** Extract the result type from a `Endpoint`. */
export type EndpointType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<unknown, infer Y> ? Y : never;

/**
 * Represent a GET request to a specified path, with validated payload and return types.
 * "The GET method requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content."
 */
export function GET<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function GET<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function GET<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function GET(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("GET", path, payload, result);
}

/**
 * Represent a POST request to a specified path, with validated payload and return types.
 * "The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
 */
export function POST<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function POST<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function POST<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function POST(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("POST", path, payload, result);
}

/**
 * Represent a PUT request to a specified path, with validated payload and return types.
 * "The PUT method replaces all current representations of the target resource with the request content."
 */
export function PUT<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PUT<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function PUT<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PUT(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PUT", path, payload, result);
}

/**
 * Represent a PATCH request to a specified path, with validated payload and return types.
 * "The PATCH method applies partial modifications to a resource."
 */
export function PATCH<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PATCH<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function PATCH<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PATCH(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PATCH", path, payload, result);
}

/**
 * Represent a DELETE request to a specified path, with validated payload and return types.
 * "The DELETE method deletes the specified resource."
 */
export function DELETE<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function DELETE<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function DELETE<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function DELETE(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("DELETE", path, payload, result);
}
