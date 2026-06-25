import { type EndpointHandlers, handleEndpoints } from "../endpoint/util.js";
import type { ClientAPIProvider } from "./ClientAPIProvider.js";
import { MockAPIProvider } from "./MockAPIProvider.js";

/**
 * Provider that mocks an API that calls and matches an array of `EndpointHandler` objects returned from `Endpoint.handler()`
 * - Used to test server-side API code, calls against an API made up of multiple `Endpoint` instances.
 *
 * @see https://shelving.cc/api/MockEndpointAPIProvider
 */
export class MockEndpointAPIProvider<P, R, C> extends MockAPIProvider<P, R> {
	constructor(handlers: EndpointHandlers<C>, context: C, source?: ClientAPIProvider<P, R>) {
		super(request => handleEndpoints(this.url, handlers, request, context, this.call), source);
	}
}
