import type { Path } from "../util/path.js";
import { UNDEFINED, type Validator } from "../util/validate.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

/** Types for an HTTP request or response that does something. */
export type EndpointMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions.
 *
 * @param method The method of the resource, e.g. `GET`
 * @param path The path of the resource optionally including `{placeholder}` values, e.g. `/patient/{id}`
 * @param payload A `Validator` for the payload of the resource.
 * @param result A `Validator` for the result of the resource.
 */
export class Endpoint<P, R> implements Validator<R> {
	/** Endpoint method. */
	readonly method: EndpointMethod;

	/** Endpoint path, e.g. `/patient/{id}` */
	readonly path: Path;

	/** Payload validator. */
	readonly payload: Validator<P>;

	/** Result validator. */
	readonly result: Validator<R>;

	constructor(method: EndpointMethod, path: Path, payload: Validator<P>, result: Validator<R>) {
		this.method = method;
		this.path = path;
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Validate a payload for this resource.
	 *
	 * @returns The validated payload for this resource.
	 * @throws `Feedback` if the payload is invalid. `Feedback` instances can be reported safely back to the end client so they know how to fix their request.
	 */
	prepare(unsafePayload: unknown): P {
		return this.payload.validate(unsafePayload);
	}

	/**
	 * Validate a result for this resource.
	 *
	 * @returns The validated result for this resource.
	 * @throws `Feedback` if the value is invalid. `Feedback` instances can be reported safely back to the end client so they know how to fix their request.
	 */
	validate(unsafeResult: unknown): R {
		return this.result.validate(unsafeResult);
	}

	/**
	 * Return an `EndpointHandler` for this endpoint
	 */
	handler(callback: EndpointCallback<P, R>): EndpointHandler<P, R> {
		return { endpoint: this, callback };
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
export function GET<P, R>(path: Path, payload?: Validator<P>, result?: Validator<R>): Endpoint<P, R>;
export function GET<P>(path: Path, payload: Validator<P>): Endpoint<P, undefined>;
export function GET<R>(path: Path, payload: undefined, result: Validator<R>): Endpoint<undefined, R>;
export function GET(path: Path, payload?: Validator<unknown>, result?: Validator<unknown>): unknown {
	return new Endpoint("GET", path, payload || UNDEFINED, result || UNDEFINED);
}

/**
 * Represent a POST request to a specified path, with validated payload and return types.
 * "The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
 */
export function POST<P, R>(path: Path, payload?: Validator<P>, result?: Validator<R>): Endpoint<P, R>;
export function POST<P>(path: Path, payload: Validator<P>): Endpoint<P, undefined>;
export function POST<R>(path: Path, payload: undefined, result: Validator<R>): Endpoint<undefined, R>;
export function POST(path: Path, payload?: Validator<unknown>, result?: Validator<unknown>): unknown {
	return new Endpoint("POST", path, payload || UNDEFINED, result || UNDEFINED);
}

/**
 * Represent a PUT request to a specified path, with validated payload and return types.
 * "The PUT method replaces all current representations of the target resource with the request content."
 */
export function PUT<P, R>(path: Path, payload?: Validator<P>, result?: Validator<R>): Endpoint<P, R>;
export function PUT<P>(path: Path, payload: Validator<P>): Endpoint<P, undefined>;
export function PUT<R>(path: Path, payload: undefined, result: Validator<R>): Endpoint<undefined, R>;
export function PUT(path: Path, payload?: Validator<unknown>, result?: Validator<unknown>): unknown {
	return new Endpoint("PUT", path, payload || UNDEFINED, result || UNDEFINED);
}

/**
 * Represent a PATCH request to a specified path, with validated payload and return types.
 * "The PATCH method applies partial modifications to a resource."
 */
export function PATCH<P, R>(path: Path, payload?: Validator<P>, result?: Validator<R>): Endpoint<P, R>;
export function PATCH<P>(path: Path, payload: Validator<P>): Endpoint<P, undefined>;
export function PATCH<R>(path: Path, payload: undefined, result: Validator<R>): Endpoint<undefined, R>;
export function PATCH(path: Path, payload?: Validator<unknown>, result?: Validator<unknown>): unknown {
	return new Endpoint("PATCH", path, payload || UNDEFINED, result || UNDEFINED);
}

/**
 * Represent a DELETE request to a specified path, with validated payload and return types.
 * "The DELETE method deletes the specified resource."
 */
export function DELETE<P, R>(path: Path, payload?: Validator<P>, result?: Validator<R>): Endpoint<P, R>;
export function DELETE<P>(path: Path, payload: Validator<P>): Endpoint<P, undefined>;
export function DELETE<R>(path: Path, payload: undefined, result: Validator<R>): Endpoint<undefined, R>;
export function DELETE(path: Path, payload?: Validator<unknown>, result?: Validator<unknown>): unknown {
	return new Endpoint("DELETE", path, payload || UNDEFINED, result || UNDEFINED);
}
