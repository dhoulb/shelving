import { RequiredError } from "../../error/RequiredError.js";
import { type Schema, UNDEFINED } from "../../schema/Schema.js";
import type { ImmutableArray } from "../../util/array.js";
import { type Data, isData } from "../../util/data.js";
import type { AnyCaller } from "../../util/function.js";
import type { RequestMethod, RequestParams } from "../../util/http.js";
import type { AbsolutePath } from "../../util/path.js";
import { getPlaceholders, matchPathTemplate, renderPathTemplate, type TemplatePlaceholders } from "../../util/template.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

/**
 * A typed API resource definition pairing a method and path with payload and result schemas.
 * - Acts as the contract both ends of an API agree on: providers render requests from it, handlers validate against it.
 * - Path may contain `{placeholder}` segments that are filled from the payload at request time.
 *
 * @param method The method of the endpoint, e.g. `GET`
 * @param path Endpoint path, possibly including placeholders e.g. `/users/{id}`
 * @param payload A `Schema` for the payload of the endpoint.
 * @param result A `Schema` for the result of the endpoint.
 *
 * @example
 * const getUser = new Endpoint("GET", "/users/{id}", USER_PAYLOAD, USER_RESULT);
 *
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint
 */
export class Endpoint<P = unknown, R = unknown> {
	/**
	 * The HTTP method this endpoint responds to, e.g. `GET`
	 *
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/method
	 */
	readonly method: RequestMethod;

	/**
	 * Endpoint path, possibly including placeholders e.g. `/users/{id}`
	 *
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/path
	 */
	readonly path: AbsolutePath;

	/**
	 * The `{placeholder}` segments extracted from `path`, used to render and match URLs.
	 *
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/placeholders
	 */
	readonly placeholders: TemplatePlaceholders;

	/**
	 * The `Schema` that request payloads are validated against.
	 *
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/payload
	 */
	readonly payload: Schema<P>;

	/**
	 * The `Schema` that response results are validated against.
	 *
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/result
	 */
	readonly result: Schema<R>;

	constructor(method: RequestMethod, path: AbsolutePath, payload: Schema<P>, result: Schema<R>) {
		this.method = method;
		this.path = path;
		this.placeholders = getPlaceholders(path);
		this.payload = payload;
		this.result = result;
	}

	/**
	 * Render the path for this endpoint with the given payload.
	 * - Path might contain `{placeholder}` values that are replaced with values from `payload`.
	 *
	 * @param payload The payload supplying values for any `{placeholders}` in the path.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns The rendered absolute path, with any `{placeholders}` filled from `payload`.
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @example endpoint.renderPath({ id: "abc" }) // "/users/abc"
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/renderPath
	 */
	renderPath(payload: P, caller: AnyCaller = this.renderPath): AbsolutePath {
		// Placeholders.
		if (this.placeholders.length) {
			assertPlaceholderPayload(payload, this, caller);
			return renderPathTemplate(this.path, payload, caller);
		}

		// No placeholders.
		return this.path;
	}

	/**
	 * Match a method/path pair against this endpoint and return any matched `{placeholder}` params.
	 *
	 * @param method The request method to compare against this endpoint's method.
	 * @param path The request path to match against this endpoint's path template.
	 * @param caller The function to attribute thrown errors to (defaults to this method).
	 * @returns A dictionary of matched `{placeholder}` params, or `undefined` if the method or path doesn't match.
	 * @example endpoint.match("GET", "/users/abc") // { id: "abc" }
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/match
	 */
	match(method: RequestMethod, path: AbsolutePath, caller: AnyCaller = this.match): RequestParams | undefined {
		if (method !== this.method) return undefined;
		return matchPathTemplate(this.path, path, caller);
	}

	/**
	 * Create an endpoint handler pairing for this endpoint.
	 *
	 * @param callback The callback function that implements the logic for this endpoint by receiving the payload and returning the response.
	 * @returns An `EndpointHandler` object combining this endpoint and the callback into a single typed object.
	 * @example endpoint.handler((payload, request) => ({ ...payload }))
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/handler
	 */
	handler<C>(callback: EndpointCallback<P, R, C>): EndpointHandler<P, R, C> {
		return { endpoint: this, callback };
	}

	/**
	 * Convert this endpoint to a string in `METHOD /path` form, e.g. `GET /user/{id}`
	 *
	 * @returns The method and path joined with a space, e.g. `GET /user/{id}`
	 * @example endpoint.toString() // "GET /users/{id}"
	 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoint/toString
	 */
	toString(): string {
		return `${this.method} ${this.path}`;
	}
}

/**
 * An `Endpoint` with any payload and result type, for use where the specific types don't matter.
 *
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/AnyEndpoint
 */
// biome-ignore lint/suspicious/noExplicitAny: Intentional.
export type AnyEndpoint = Endpoint<any, any>;

/**
 * An immutable list of endpoints.
 *
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/Endpoints
 */
export type Endpoints = ImmutableArray<AnyEndpoint>;

/**
 * Extract the payload type from an `Endpoint`.
 *
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/PayloadType
 */
export type PayloadType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<infer Y, unknown> ? Y : never;

/**
 * Extract the result type from an `Endpoint`.
 *
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/EndpointType
 */
export type EndpointType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<unknown, infer Y> ? Y : never;

/**
 * Define a `HEAD` endpoint at a path, with validated payload and result types.
 * - "The HEAD method requests a representation of the specified resource. Requests using HEAD should only retrieve data and should not contain a request content."
 *
 * *Factory for `Endpoint`.*
 *
 * @param path The endpoint path, possibly including `{placeholders}`
 * @param payload An optional `Schema` validating the request payload.
 * @param result An optional `Schema` validating the response result.
 * @returns An `Endpoint` configured for the `HEAD` method.
 * @example HEAD("/users/{id}")
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/HEAD
 */
export function HEAD<P extends Data, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function HEAD<P extends Data>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function HEAD<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function HEAD(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("HEAD", path, payload, result);
}

/**
 * Define a `GET` endpoint at a path, with validated payload and result types.
 * - "The GET method requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content."
 *
 * *Factory for `Endpoint`.*
 *
 * @param path The endpoint path, possibly including `{placeholders}`
 * @param payload An optional `Schema` validating the request payload.
 * @param result An optional `Schema` validating the response result.
 * @returns An `Endpoint` configured for the `GET` method.
 * @example GET("/users/{id}", undefined, USER)
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/GET
 */
export function GET<P extends Data, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function GET<P extends Data>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function GET<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function GET(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("GET", path, payload, result);
}

/**
 * Define a `POST` endpoint at a path, with validated payload and result types.
 * - "The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server."
 *
 * *Factory for `Endpoint`.*
 *
 * @param path The endpoint path, possibly including `{placeholders}`
 * @param payload An optional `Schema` validating the request payload.
 * @param result An optional `Schema` validating the response result.
 * @returns An `Endpoint` configured for the `POST` method.
 * @example POST("/users", USER, USER_RESULT)
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/POST
 */
export function POST<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function POST<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function POST<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function POST(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("POST", path, payload, result);
}

/**
 * Define a `PUT` endpoint at a path, with validated payload and result types.
 * - "The PUT method replaces all current representations of the target resource with the request content."
 *
 * *Factory for `Endpoint`.*
 *
 * @param path The endpoint path, possibly including `{placeholders}`
 * @param payload An optional `Schema` validating the request payload.
 * @param result An optional `Schema` validating the response result.
 * @returns An `Endpoint` configured for the `PUT` method.
 * @example PUT("/users/{id}", USER)
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/PUT
 */
export function PUT<P, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function PUT<P>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function PUT<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function PUT(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("PUT", path, payload, result);
}

/**
 * Define a `PATCH` endpoint at a path, with validated payload and result types.
 * - "The PATCH method applies partial modifications to a resource."
 *
 * *Factory for `Endpoint`.*
 *
 * @param path The endpoint path, possibly including `{placeholders}`
 * @param payload An optional `Schema` validating the request payload.
 * @param result An optional `Schema` validating the response result.
 * @returns An `Endpoint` configured for the `PATCH` method.
 * @example PATCH("/users/{id}", PARTIAL_USER)
 * @see https://dhoulb.github.io/shelving/api/endpoint/Endpoint/PATCH
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

/** Assert that an endpoint with `{placeholders}` only allows data payloads. */
function assertPlaceholderPayload<P, R>(
	payload: unknown,
	endpoint: Endpoint<P, R>,
	caller: AnyCaller = assertPlaceholderPayload,
): asserts payload is Data {
	if (!isData(payload))
		throw new RequiredError("Payload for request with URL {placeholders} must be data object", {
			endpoint,
			received: payload,
			caller,
		});
}
