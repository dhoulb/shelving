import { type EndpointContext, type EndpointHandlers, handleEndpoints } from "../endpoint/util.js";
import { MockAPIProvider, type MockAPIProviderOptions } from "./MockAPIProvider.js";

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
export class MockEnpdointAPIProvider<C extends EndpointContext> extends MockAPIProvider {
	constructor(handlers: EndpointHandlers<C>, c: Omit<EndpointContext, "request">, options: MockAPIProviderOptions) {
		super(request => handleEndpoints<C>(this.url, handlers, { ...c, request } as C), options);
	}
}
