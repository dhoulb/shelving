import { type EndpointHandlers, handleEndpoints } from "../endpoint/util.js";
import type { ClientAPIProvider } from "./ClientAPIProvider.js";
import { MockAPIProvider } from "./MockAPIProvider.js";

/**
 * Provider that mocks an API that calls and matches an array of `EndpointHandler` objects returned from `Endpoint.handler()`
 * - Used to test server-side API code, calls against an API made up of multiple `Endpoint` instances.
 *
 * @example
 *  const endpoint = POST("/squared", INTEGER, INTEGER); // Create an endpoint designed to square its input number.
 *  const handlers = [endpoint.handler(num => num * num)]; // Implement handlers for the endpoints.
 * 	const api = new MockEnpdointAPIProvider(handlers); // Create a new mock provider.
 *  const result = await api.fetch(endpoint, 4); // Mock a call to the endpoint through the provider.
 *  expect(result).toBe(16);
 */
export class MockEndpointAPIProvider<P, R, C> extends MockAPIProvider<P, R> {
	constructor(handlers: EndpointHandlers<C>, context: C, source?: ClientAPIProvider<P, R>) {
		super(request => handleEndpoints(this.url, handlers, request, context, this.fetch), source);
	}
}
