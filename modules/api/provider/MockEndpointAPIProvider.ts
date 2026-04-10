import { type EndpointHandlers, handleEndpoints } from "../endpoint/util.js";
import { MockAPIProvider, type MockAPIProviderOptions } from "./MockAPIProvider.js";

/**
 * Construction options for a `MockAPIProvider`
 * - Same as options for a normal `MockAPIProviderOptions`, but with a `context` property for the endpoints.
 */
export interface MockEndpointAPIProviderOptions<C = void> extends MockAPIProviderOptions {
	context: C;
}

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
export class MockEndpointAPIProvider<C> extends MockAPIProvider {
	constructor(handlers: EndpointHandlers<C>, { context, ...options }: MockEndpointAPIProviderOptions<C>) {
		super(request => handleEndpoints(this.url, handlers, request, context, this.fetch), options);
	}
}
