import { RequiredError } from "../../error/RequiredError.js";
import { ResponseError } from "../../error/ResponseError.js";
import { type Schema, UNDEFINED } from "../../schema/Schema.js";
import type { ImmutableArray } from "../../util/array.js";
import { type Data, isData } from "../../util/data.js";
import { getMessage } from "../../util/error.js";
import type { AnyCaller, Arguments } from "../../util/function.js";
import { getRequest, getResponseContent, type RequestMethod, type RequestOptions, type RequestParams } from "../../util/http.js";
import { omitProps } from "../../util/object.js";
import type { AbsolutePath } from "../../util/path.js";
import { getPlaceholders, matchTemplate, renderTemplate, type TemplatePlaceholders } from "../../util/template.js";
import { type PossibleURL, requireBaseURL, requireURL } from "../../util/url.js";
import type { EndpointCallback, EndpointHandler } from "./util.js";

/**
 * An abstract API resource definition, used to specify types for e.g. serverless functions.
 *
 * @param method The method of the endpoint, e.g. `GET`
 * @param path Endpoint path, possibly including placeholders e.g. `/users/{id}`
 * @param payload A `Schema` for the payload of the endpoint.
 * @param result A `Schema` for the result of the endpoint.
 */
export class Endpoint<P, R> {
	/** Endpoint method. */
	readonly method: RequestMethod;

	/** Endpoint path, possibly including placeholders e.g. `/users/{id}` */
	readonly path: AbsolutePath;

	/** Endpoint path, possibly including placeholders e.g. `/users/{id}` */
	readonly placeholders: TemplatePlaceholders;

	/** Payload schema. */
	readonly payload: Schema<P>;

	/** Result schema. */
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
	 * @returns URL string combining `base` with this endpoint's path, with any `{placeholders}` rendered and `?query` params added.
	 *
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 */
	renderPath(payload: P, caller: AnyCaller = this.renderPath): AbsolutePath {
		// Placeholders.
		if (this.placeholders.length) {
			assertPlaceholderPayload(payload, this, caller);
			return renderTemplate(this.path, payload, caller) as AbsolutePath;
		}

		// No placeholders.
		return this.path;
	}

	/**
	 * Create a `Request` that targets this endpoint with a given base URL.
	 * - Path `{placeholders}` are rendered from the payload.
	 * - For `GET` and `HEAD`, remaining payload fields are appended as `?query` params.
	 * - For all other requests, payload is sent as the body.
	 *
	 * @param base The base URL where this endpoint is targeted. Base URL conversion rules from `getBaseURL()` apply so only the `origin` and `pathname` are kept and always has a trailing slash.
	 *
	 * @throws {RequiredError} if this endpoint's path has `{placeholders}` but `payload` is not a data object.
	 * @throws {RequiredError} if this is a `HEAD` or `GET` request but `payload` is not a data object.
	 */
	getRequest(base: PossibleURL, payload: P, options?: RequestOptions, caller: AnyCaller = this.getRequest): Request {
		// Render the path into the base URL.
		const url = requireURL(`.${this.renderPath(payload, caller)}`, requireBaseURL(base, undefined, caller), caller).href;

		// Placeholders are rendered into the path so get omitted from the body payload.
		if (this.placeholders.length) {
			assertPlaceholderPayload(payload, this, caller);
			return getRequest(this.method, url, omitProps(payload, ...this.placeholders), options);
		}

		// No placeholders.
		return getRequest(this.method, url, payload, options);
	}

	/**
	 * Match a method/path pair against this endpoint and return any matched `{placeholder}` params.
	 */
	match(method: RequestMethod, path: AbsolutePath, caller: AnyCaller = this.match): RequestParams | undefined {
		if (method !== this.method) return undefined;
		return matchTemplate(this.path, path, caller);
	}

	/**
	 * Create an endpoint handler pairing for this endpoint.
	 * @param callback The callback function that implements the logic for this endpoint by receiving the payload and returning the response.
	 * @returns An `EndpointHandler` object combining this endpoint and the callback into a single typed object.
	 */
	handler<A extends Arguments = []>(callback: EndpointCallback<P, R, A>): EndpointHandler<P, R, A> {
		return { endpoint: this, callback };
	}

	/**
	 * Parse an HTTP `Response` for this endpoint and validate it against the result schema.
	 * - Non-2xx responses become `ResponseError`.
	 * - Invalid success payloads also become `ResponseError`.
	 */
	async parseResponse(response: Response, caller: AnyCaller = this.parseResponse): Promise<R> {
		const { ok, status } = response;
		const content = await getResponseContent(response, caller);

		if (!ok) throw new ResponseError(getMessage(content) ?? `Error ${status}`, { code: status, cause: response, caller });

		try {
			return this.result.validate(content);
		} catch (thrown) {
			// Thrown string indicates a validation error in the returned response.
			if (typeof thrown === "string")
				throw new ResponseError(`Invalid result for ${this.toString()}:\n${thrown}`, { endpoint: this, code: 422, caller });

			throw thrown;
		}
	}

	/** Convert to string, e.g. `GET /user/{id}` */
	toString(): string {
		return `${this.method} ${this.path}`;
	}
}

/** Any endpoint. */
// biome-ignore lint/suspicious/noExplicitAny: Intentional.
export type AnyEndpoint = Endpoint<any, any>;

/** List of endpoints. */
export type Endpoints = ImmutableArray<AnyEndpoint>;

/** Extract the payload type from a `Endpoint`. */
export type PayloadType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<infer Y, unknown> ? Y : never;

/** Extract the result type from a `Endpoint`. */
export type EndpointType<X extends Endpoint<unknown, unknown>> = X extends Endpoint<unknown, infer Y> ? Y : never;

/**
 * Represent a HEAD request to a specified path, with validated payload and return types.
 * "The HEAD method requests a representation of the specified resource. Requests using HEAD should only retrieve data and should not contain a request content."
 */
export function HEAD<P extends Data, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function HEAD<P extends Data>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
export function HEAD<R>(path: AbsolutePath, payload: undefined, result: Schema<R>): Endpoint<undefined, R>;
export function HEAD(path: AbsolutePath, payload = UNDEFINED, result = UNDEFINED): unknown {
	return new Endpoint("HEAD", path, payload, result);
}

/**
 * Represent a GET request to a specified path, with validated payload and return types.
 * "The GET method requests a representation of the specified resource. Requests using GET should only retrieve data and should not contain a request content."
 */
export function GET<P extends Data, R>(path: AbsolutePath, payload?: Schema<P>, result?: Schema<R>): Endpoint<P, R>;
export function GET<P extends Data>(path: AbsolutePath, payload: Schema<P>): Endpoint<P, undefined>;
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
